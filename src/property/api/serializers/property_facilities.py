from typing import TYPE_CHECKING
from rest_framework import serializers
from property.models import Property
from building.api.serializers import BuildingFacilitiesSerializer

if TYPE_CHECKING:
    _Base = serializers.ModelSerializer[Property]
else:
    _Base = serializers.ModelSerializer


class PropertyFacilitiesSerializer(_Base):
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