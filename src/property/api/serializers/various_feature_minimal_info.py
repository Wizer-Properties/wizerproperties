from rest_framework import serializers
from property.models import Property


# Serializer for handling popular, newly added, and discounted properties in search page.
# This serializer is designed to retrieve a list of properties with various attributes.
class PropertyVariousFeatureMinimalInfoSerializer(serializers.ModelSerializer):
    type = serializers.CharField(source="building.type", read_only=True)
    address = serializers.CharField(source="building.address", read_only=True)

    class Meta:
        model = Property
        fields = ["id", "number_of_bedroom", "type", "address"]
