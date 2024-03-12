from rest_framework import serializers
from property.models import Property


class PropertyComparisonsListSerializer(serializers.ModelSerializer):
    building_type = serializers.CharField(source="building.type", read_only=True)
    address = serializers.CharField(source="building.address", read_only=True)
    construction_year = serializers.IntegerField(source="building.construction_year", read_only=True)
    quota = serializers.CharField(source="building.quota", read_only=True)
    furnishing = serializers.CharField(source="building.furnishing", read_only=True)
    distance_from_location_to_BTS_or_MRT = serializers.CharField(
        source="building.distance_from_location_to_BTS_or_MRT", read_only=True
    )
    distance_from_location_to_ARL = serializers.CharField(
        source="building.distance_from_location_to_ARL", read_only=True
    )
    have_freehold = serializers.BooleanField(source="building.have_freehold", read_only=True)
    have_leasehold = serializers.BooleanField(source="building.have_leasehold", read_only=True)
    have_infinity_pool = serializers.BooleanField(source="building.have_infinity_pool", read_only=True)
    have_pets_allowed = serializers.BooleanField(source="building.have_pets_allowed", read_only=True)
    have_guard_house = serializers.BooleanField(source="building.have_guard_house", read_only=True)
    have_sauna = serializers.BooleanField(source="building.address", read_only=True)
    have_sky_lounge = serializers.BooleanField(source="building.have_sky_lounge", read_only=True)
    have_grocery = serializers.BooleanField(source="building.have_grocery", read_only=True)
    have_fitness_area = serializers.BooleanField(source="building.have_fitness_area", read_only=True)
    default_image = serializers.URLField(source="default_image_url", read_only=True)
    ariel_view = serializers.URLField(source="ariel_video_url", read_only=True)
    facility_view = serializers.URLField(source="building.facility_view", read_only=True)
    location_view = serializers.URLField(source="building.location_view", read_only=True)
    view = serializers.URLField(source="building.view", read_only=True)

    class Meta:
        model = Property
        fields = [
            "id",
            "title",
            "price",
            "price_per_sqm",
            "number_of_bedroom",
            "number_of_bathroom",
            "number_of_balcony",
            "number_of_car_parking",
            "balcony_direction",
            "main_door_direction",
            "unit_position",
            "have_vacant",
            "have_owner_occupied",
            "have_bathtub",
            "have_duplex",
            "building_id",
            "building_type",
            "address",
            "construction_year",
            "quota",
            "furnishing",
            "distance_from_location_to_BTS_or_MRT",
            "distance_from_location_to_ARL",
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
            "interior_view",
            "ariel_view",
            "facility_view",
            "location_view",
            "view",
            "unit_area",
        ]
