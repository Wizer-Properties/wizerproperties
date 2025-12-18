from typing import TYPE_CHECKING
from rest_framework import serializers
from building.models import Building

if TYPE_CHECKING:
    _Base = serializers.ModelSerializer[Building]
else:
    _Base = serializers.ModelSerializer


class ScheduleBuildingSerializer(_Base):
    class Meta:
        model = Building
        fields = [
            "id",
            "title",
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
