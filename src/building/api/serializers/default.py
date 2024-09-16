from rest_framework import serializers
from building.models import Building


class BuildingSerializer(serializers.ModelSerializer):
    class Meta:
        model = Building
        fields = [
            "id",
            "title",
            "description",
            "type",
            "sub_type",
            "total_units_for_sale",
            "address",
            "project_total_area",
            "total_floors",
            "facility_view",
            "location_view",
            "created_at",
            "updated_at",
        ]


class BuildingInfoSerializerRead(serializers.ModelSerializer):
    class Meta:
        model = Building
        fields = [
            "id",
            "province",
            "district",
            "sub_district",
            "construction_year",
            "total_floors",
            "project_total_area",
            "distance_from_location_to_BTS_or_MRT",
            "distance_from_location_to_ARL",
            "quota",
            "have_freehold",
            "have_leasehold",
            "have_infinity_pool",
            "have_pets_allowed",
            "have_guard_house",
            "have_sauna",
            "have_sky_lounge",
            "have_grocery",
            "have_fitness_area",
            "view",
            "created_at",
            "updated_at"
        ]
