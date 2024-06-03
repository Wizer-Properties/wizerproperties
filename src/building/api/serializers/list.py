from rest_framework import serializers
from .default import BuildingSerializer


class BuildingListSerializer(BuildingSerializer):
    created_by = serializers.CharField(source="created_by.username", read_only=True)
    status = serializers.CharField(source="get_status_display", read_only=True)

    class Meta(BuildingSerializer.Meta):
        fields = BuildingSerializer.Meta.fields + [
            "lowest_price",
            "highest_price",
            "latitude",
            "longitude",
            "province",
            "district",
            "sub_district",
            "status",
            "construction_year",
            "quota",
            "furnishing",
            "distance_from_location_to_BTS_or_MRT",
            "distance_from_location_to_ARL",
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
            "is_active",
            "created_by",
        ]
