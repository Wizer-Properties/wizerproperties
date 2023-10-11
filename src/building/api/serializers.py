from rest_framework import serializers
from building.models import Building, BuildingMedia


class BuildingMediaSerializer(serializers.ModelSerializer):
    class Meta:
        model = BuildingMedia
        fields = ["id", "type", "file"]


class BuildingSerializer(serializers.ModelSerializer):
    media_files = BuildingMediaSerializer(many=True, read_only=True)

    class Meta:
        model = Building
        fields = [
            "id",
            "title",
            "description",
            "price",
            "type",
            "total_units_for_sale",
            "media_files",
            "address",
            "project_total_area",
            "total_floors",
            "construction_year",
            "have_lake_or_river_view",
            "have_guard_house",
            "have_sauna",
            "have_sky_lounge",
            "have_grocery",
            "have_fitness_area",
            "is_active",
        ]
