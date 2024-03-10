from rest_framework import serializers
from property.models import Property
from building.api.serializers import BuildingFacilitiesSerializer

class PropertyFacilitiesSerializer(serializers.ModelSerializer):
    building = BuildingFacilitiesSerializer()

    class Meta:
        model = Property
        fields = [
            "id",
            "have_tenant_occupied",
            "have_vacant",
            "have_owner_occupied",
            "have_bathtub",
            "have_duplex",
            "building"
        ]