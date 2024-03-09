from django.db.models import OuterRef, Subquery, Value, F, CharField, When, Case, BooleanField
from django.db.models.functions import Concat
from rest_framework import serializers
from property.models import Property, PropertyMedia, CompareProperty
from building.models import BuildingMedia
from .comparisons_list import PropertyComparisonsListSerializer


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
            property = (
                Property.objects.filter(id=obj.property.id)
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
            return PropertyComparisonsListSerializer(property).data
        else:
            return obj.property.title
