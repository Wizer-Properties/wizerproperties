from rest_framework import serializers
from .default import PropertySerializer


class PropertyAvailableUnitsSerializer(PropertySerializer):
    default_image = serializers.URLField(source="default_image_url", read_only=True)

    class Meta(PropertySerializer.Meta):
        fields = PropertySerializer.Meta.fields + ["default_image"]
