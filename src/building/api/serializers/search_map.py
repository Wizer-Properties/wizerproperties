from rest_framework import serializers
from building.models import Building


class BuildingSearchMapSerializer(serializers.ModelSerializer):

    class Meta:
        model = Building
        fields = ["id", "latitude", "longitude"]
