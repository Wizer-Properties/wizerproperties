from django.db import models
from django.utils import timezone
from django.core.exceptions import ValidationError

from core.models import TimestampedModel
from property.models import Property


class DiscountProperty(TimestampedModel):
    property = models.ForeignKey(Property, null=True, on_delete=models.SET_NULL)
    period = models.DateField(null=True)

    class Meta:
        verbose_name_plural = "Discount properties"

    def clean(self):
        error_messages = {}

        # Check if there is already an object with the same property
        existing_objects = self.__class__.objects.filter(property=self.property)
        if self.id:
            existing_objects = existing_objects.exclude(id=self.id)  # Exclude the current object for updates

        if existing_objects.exists():
            error_messages.update({"property": "The property have already in discount list."})

        # Period will be future date
        if self.period and self.period < timezone.now().date():
            error_messages.update({"period": "Period date must be greater than or equal to today."})

        if error_messages:
            raise ValidationError(error_messages)
