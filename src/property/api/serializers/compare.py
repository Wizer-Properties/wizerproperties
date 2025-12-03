import logging
from django.db.models import OuterRef, Subquery, Value, F, CharField, When, Case, BooleanField
from django.db.models.functions import Concat
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
        instance = CompareProperty(**attrs)
        user = self.context["request"].user

        instance.user = user
        instance.full_clean()  # Perform full validation before saving

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
