from rest_framework import serializers
from property.models import Property
from building.models import Building


class ScheduleBuildingSerializer(serializers.ModelSerializer):
    class Meta:
        model = Building
        fields = [
            "id",
            "type",
            "address",
            "have_freehold",
            "have_leasehold",
            "have_infinity_pool",
            "have_pets_allowed",
            "have_guard_house",
            "have_sauna",
            "have_sky_lounge",
            "have_grocery",
            "have_fitness_area",
        ]


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
            "price",
            "price_per_sqm",
            "unit_area",
            "floor_number",
            "number_of_bedroom",
            "number_of_bathroom",
            "building",
        ]
