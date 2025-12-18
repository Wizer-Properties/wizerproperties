from typing import TYPE_CHECKING
from rest_framework import serializers
from property.models import Property
from building.api.serializers import ScheduleBuildingSerializer

if TYPE_CHECKING:
    _Base = serializers.ModelSerializer[Property]
else:
    _Base = serializers.ModelSerializer


class SchedulePropertySerializer(_Base):
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

class ExtendPropertyFacilitiesSerializer(SchedulePropertySerializer):
    sub_district = serializers.CharField(source="building.sub_district", read_only=True)
    district = serializers.CharField(source="building.district", read_only=True)
    province = serializers.CharField(source="building.province", read_only=True)

    class Meta:
         model = Property
         fields = SchedulePropertySerializer.Meta.fields + ['sub_district', 'district', 'province',]
