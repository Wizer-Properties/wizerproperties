from django.db import models

from core.models import TimestampedModel
from property.models import Property


class FeatureProperty(TimestampedModel):
    property = models.ForeignKey(Property, null=True, on_delete=models.SET_NULL, related_name="features")

    class Meta:
        verbose_name_plural = "Feature properties"
        constraints = [
            models.UniqueConstraint(fields=['property'], name='unique_feature_property')
        ]
