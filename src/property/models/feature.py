from django.db import models
from django.core.exceptions import ValidationError

from core.models import TimestampedModel
from property.models import Property


class FeatureProperty(TimestampedModel):
    property = models.ForeignKey(Property, null=True, on_delete=models.SET_NULL, related_name="features")

    class Meta:
        verbose_name_plural = "Feature properties"
        constraints = [
            models.UniqueConstraint(fields=['property'], name='unique_feature_property')
        ]
    
    def clean(self):
        # Check if the property is already associated with a DiscountProperty
        if self.property and self.property.discounts.exists():
            raise ValidationError({"property": "The property is already in the discount list."})

