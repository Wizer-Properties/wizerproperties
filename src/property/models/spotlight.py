from django.db import models
from django.core.exceptions import ValidationError

from core.models import TimestampedModel
from property.models import Property


class SpotlightProperty(TimestampedModel):
    property = models.ForeignKey(Property, null=True, on_delete=models.SET_NULL, related_name="spotlights")

    class Meta:
        verbose_name_plural = "Spotlight properties"

    def clean(self):
        # Check if there is already an object with the same property
        existing_objects = self.__class__.objects.filter(property=self.property)
        if self.id:
            existing_objects = existing_objects.exclude(id=self.id)  # Exclude the current object for updates

        if existing_objects.exists():
            raise ValidationError({"property": "The property have already in spotlight list."})
