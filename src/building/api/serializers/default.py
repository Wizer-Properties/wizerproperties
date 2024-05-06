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
            "total_units_for_sale",
            "address",
            "project_total_area",
            "total_floors",
            "facility_view",
            "location_view",
            "created_at",
            "updated_at",
        ]
