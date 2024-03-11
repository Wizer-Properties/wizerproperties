from rest_framework import serializers
from property.models import Property


class PropertyFavoriteListSerializer(serializers.ModelSerializer):
    building_type = serializers.CharField(source="building.type", read_only=True)
    address = serializers.CharField(source="building.address", read_only=True)
    have_freehold = serializers.BooleanField(source="building.have_freehold", read_only=True)
    have_leasehold = serializers.BooleanField(source="building.have_leasehold", read_only=True)
    have_infinity_pool = serializers.BooleanField(source="building.have_infinity_pool", read_only=True)
    have_pets_allowed = serializers.BooleanField(source="building.have_pets_allowed", read_only=True)
    have_guard_house = serializers.BooleanField(source="building.have_guard_house", read_only=True)
    have_sauna = serializers.BooleanField(source="building.address", read_only=True)
    have_sky_lounge = serializers.BooleanField(source="building.have_sky_lounge", read_only=True)
    have_grocery = serializers.BooleanField(source="building.have_grocery", read_only=True)
    have_fitness_area = serializers.BooleanField(source="building.have_fitness_area", read_only=True)
    is_compared = serializers.BooleanField(read_only=True)
    is_favorited = serializers.BooleanField(read_only=True)
    default_image = serializers.URLField(source="default_image_url", read_only=True)

    class Meta:
        model = Property
        fields = [
            "id",
            "title",
            "description",
            "price",
            "price_per_sqm",
            "floor_number",
            "unit_area",
            "number_of_bedroom",
            "number_of_bathroom",
            "building_id",
            "building_type",
            "address",
            "have_freehold",
            "have_leasehold",
            "have_infinity_pool",
            "have_pets_allowed",
            "have_guard_house",
            "have_sauna",
            "have_sky_lounge",
            "have_grocery",
            "have_fitness_area",
            "default_image",
            "is_compared",
            "is_favorited",
        ]
