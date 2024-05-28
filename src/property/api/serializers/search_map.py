from rest_framework import serializers
from property.models import Property
from building.models import Building
from building.api.serializers import BuildingSearchMapSerializer


class PropertySearchMapSerializer(serializers.ModelSerializer):
    building_info = serializers.SerializerMethodField()

    class Meta:
        model = Property
        fields = [
            "id",
            "building_info",
        ]

    def get_building_info(self, obj):
        if obj.building:
            building = Building.objects.filter(id=obj.building.id).first()
            return BuildingSearchMapSerializer(building).data
        else:
            return None
