from typing import TYPE_CHECKING
from rest_framework import serializers
from building.models import Building

if TYPE_CHECKING:
    _Base = serializers.ModelSerializer[Building]
else:
    _Base = serializers.ModelSerializer


class BuildingSearchMapSerializer(_Base):

    class Meta:
        model = Building
        fields = ["id", "latitude", "longitude"]
