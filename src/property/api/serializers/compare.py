import logging
from django.db.models import OuterRef, Subquery, Value, F, CharField, When, Case, BooleanField
from django.db.models.functions import Concat
from django.core.exceptions import ValidationError as DjangoValidationError
from rest_framework import serializers
from property.models import Property, PropertyMedia, CompareProperty
from building.models import BuildingMedia
from .comparisons_list import PropertyComparisonsListSerializer

logger = logging.getLogger(__name__)


class ComparePropertySerializer(serializers.ModelSerializer):
    property_info = serializers.SerializerMethodField()

    class Meta:
        model = CompareProperty
        fields = ["id", "user", "property", "property_info"]
        extra_kwargs = {
            "property": {"write_only": True},  # Exclude the property field from the response
        }

    def validate(self, attrs):
        """
        Validate that the property can be added to comparison.
        Checks for duplicates and ensures user is authenticated.
        """
        user = self.context["request"].user
        property_id = attrs.get("property")
        
        if not user or not user.is_authenticated:
            raise serializers.ValidationError("You must be authenticated to add properties to comparison.")
        
        if not property_id:
            raise serializers.ValidationError({"property": "Property is required."})
        
        # Check if this property is already in the user's comparison list
        existing = CompareProperty.objects.filter(user=user, property=property_id).exists()
        if existing:
            raise serializers.ValidationError(
                {"property": "This property is already in your comparison list."}
            )
        
        # Create instance and validate using model's clean method
        instance = CompareProperty(user=user, property=property_id)
        try:
            instance.full_clean()
        except DjangoValidationError as e:
            # Convert Django ValidationError to DRF ValidationError
            error_dict = {}
            if hasattr(e, 'message_dict'):
                error_dict = e.message_dict
            elif hasattr(e, 'messages'):
                error_dict = {'__all__': e.messages}
            else:
                error_dict = {'__all__': [str(e)]}
            raise serializers.ValidationError(error_dict)
        
        return attrs

    def get_property_info(self, obj):
        request = self.context.get("request")
        if request and request.method == "GET" and obj.property:
            try:
                property = (
                    Property.objects.filter(id=obj.property.id)
                    .select_related("building")
                    .annotate(
                        default_image_url=Subquery(
                            PropertyMedia.objects.filter(property=OuterRef("pk"), type="image")
                            .annotate(full_file_url=Concat(Value("/media/"), F("file"), output_field=CharField()))
                            .values("full_file_url")[:1]
                        ),
                        ariel_video_url=Subquery(
                            BuildingMedia.objects.filter(building=OuterRef("building_id"), type="aerial_drone_video")
                            .annotate(full_file_url=Concat(Value("/media/"), F("file"), output_field=CharField()))
                            .values("full_file_url")[:1]
                        ),
                    )
                    .first()
                )
                if property:
                    return PropertyComparisonsListSerializer(property, context=self.context).data
                else:
                    return {"id": obj.property.id, "title": obj.property.title if obj.property else "Unknown Property"}
            except Exception as e:
                # Log error but return basic info to prevent 500
                logger.exception("Failed to retrieve property info for comparison")
                return {
                    "id": obj.property.id if obj.property else None,
                    "title": obj.property.title if obj.property else "Unknown Property",
                    "error": "Unable to load property details"
                }
        else:
            return obj.property.title if obj.property else "Unknown Property"
