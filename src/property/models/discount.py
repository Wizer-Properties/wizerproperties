from django.db import models
from django.utils import timezone
from django.core.exceptions import ValidationError

from core.models import TimestampedModel
from property.models import Property


class DiscountProperty(TimestampedModel):
    property = models.ForeignKey(Property, null=True, on_delete=models.SET_NULL, related_name="discounts")
    period = models.DateField(null=True)

    class Meta:
        verbose_name_plural = "Discount properties"
        constraints = [
            models.UniqueConstraint(fields=['property'], name='unique_discount_property')
        ]

    def clean(self):
        super().clean()
        
        error_messages = {}     # Error message will append here

        # Check if the property is already associated with a FeatureProperty
        if self.property and self.property.features.exists():
            error_messages.update({"property": "The property is already in the feature list."})

        # Period will be future date
        if self.period and self.period < timezone.now().date():
            error_messages.update({"period": "Period date must be greater than or equal to today."})
        
        if error_messages:
            raise ValidationError(error_messages)
