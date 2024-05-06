from rest_framework import serializers
from property.models import Property


class PropertySerializer(serializers.ModelSerializer):

    class Meta:
        model = Property
        fields = [
            "id",
            "title",
            "description",
            "price",
            "price_per_sqm",
            "floor_number",
            "unit_area",
            "number_of_bedroom",
            "number_of_bathroom",
            "created_at",
            "updated_at",
        ]
