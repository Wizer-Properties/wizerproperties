from rest_framework import serializers
from building.models import Building


class BuildingFacilitiesSerializer(serializers.ModelSerializer):
    class Meta:
        model = Building
        fields = [
            "id",
            "view",
            "have_freehold",
            "have_leasehold",
            "have_infinity_pool",
            "have_pets_allowed",
            "have_guard_house",
            "have_sauna",
            "have_sky_lounge",
            "have_grocery",
            "have_fitness_area",
            "distance_from_location_to_BTS_or_MRT",
            "distance_from_location_to_ARL",
        ]