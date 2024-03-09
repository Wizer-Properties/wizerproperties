from rest_framework import serializers
from building.models import Building


# Serializer for handling popular buildings.
# This serializer is designed to retrieve a list of buildings with various attributes.
class BuildingVariousFeatureMinimalInfoSerializer(serializers.ModelSerializer):

    class Meta:
        model = Building
        fields = ["id", "type", "total_units_for_sale", "address"]
