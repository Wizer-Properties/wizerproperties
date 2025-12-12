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
        Delegates duplicate detection to model.clean() via full_clean().
        Authentication is enforced by ComparePropertyPermission at the view level.
        """
        user = self.context["request"].user
        property_id = attrs.get("property")
        
        if not property_id:
            raise serializers.ValidationError({"property": "Property is required."})
        
        # Create instance and validate using model's clean method
        # This will check for duplicates and other model-level validations
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
            raise serializers.ValidationError(error_dict) from e
        
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
