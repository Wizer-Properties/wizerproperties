from rest_framework import serializers
from .default import BuildingSerializer


# Serializer for handling popular buildings.
# This serializer is designed to retrieve a list of buildings with various attributes.
class BuildingVariousFeatureSerializer(BuildingSerializer):
    default_image = serializers.URLField(source="default_image_url", read_only=True)

    class Meta(BuildingSerializer.Meta):
        fields = BuildingSerializer.Meta.fields + ["latitude", "longitude", "default_image"]
