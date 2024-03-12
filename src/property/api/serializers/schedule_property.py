from rest_framework import serializers
from property.models import Property
from building.api.serializers import ScheduleBuildingSerializer

class SchedulePropertySerializer(serializers.ModelSerializer):
    default_image = serializers.URLField(source="default_image_url", read_only=True)
    building = ScheduleBuildingSerializer()

    class Meta:
        model = Property
        fields = [
            "id",
            "default_image",
            "title",
            "description",
            "unit_area",
            "floor_number",
            "number_of_bedroom",
            "number_of_bathroom",
            "building",
        ]
