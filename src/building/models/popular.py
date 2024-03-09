from django.db import models
from django.core.exceptions import ValidationError
from core.models import TimestampedModel
from .default import Building


class PopularBuilding(TimestampedModel):
    building = models.ForeignKey(Building, null=True, on_delete=models.SET_NULL, related_name="populars")

    def clean(self):
        # Check if there is already an object with the same building
        existing_objects = self.__class__.objects.filter(building=self.building)
        if self.id:
            existing_objects = existing_objects.exclude(id=self.id)  # Exclude the current object for updates

        if existing_objects.exists():
            raise ValidationError({"property": "The building have already in popular list."})
