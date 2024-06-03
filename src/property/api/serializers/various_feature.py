from rest_framework import serializers
from .default import PropertySerializer


# Serializer for handling popular, newly added, and discounted properties.
# This serializer is designed to retrieve a list of properties with various attributes.
class PropertyVariousFeatureSerializer(PropertySerializer):
    building_title = serializers.CharField(source="building.title", read_only=True)
    building_type = serializers.CharField(source="building.type", read_only=True)
    building_status = serializers.CharField(source="building.get_status_display", read_only=True)
    address = serializers.CharField(source="building.address", read_only=True)
    default_image = serializers.URLField(source="default_image_url", read_only=True)
    is_compared = serializers.BooleanField(read_only=True)
    is_favorited = serializers.BooleanField(read_only=True)

    class Meta(PropertySerializer.Meta):
        fields = PropertySerializer.Meta.fields + [
            "building_title",
            "building_type",
            "building_status",
            "address",
            "is_compared",
            "is_favorited",
            "default_image",
        ]

    def __init__(self, *args, **kwargs):
        include_discount_period = kwargs.pop("include_discount_period", False)
        super().__init__(*args, **kwargs)

        if include_discount_period:
            self.fields["discount_period"] = serializers.DateField(source="discounts.first.period", read_only=True)
