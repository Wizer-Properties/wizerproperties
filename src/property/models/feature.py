from django.db import models
from django.core.exceptions import ValidationError
from datetime import timedelta

from core.models import TimestampedModel
from property.models import Property


class FeatureProperty(TimestampedModel):
    property = models.ForeignKey(Property, null=True, on_delete=models.SET_NULL, related_name="features")
    number_of_clicked = models.PositiveIntegerField(default=0)  # How many times user has view this property
    view_time = models.DurationField(default=timedelta(seconds=0))  # How long the viewers view this property

    class Meta:
        verbose_name_plural = "Feature properties"
        constraints = [
            models.UniqueConstraint(fields=['property'], name='unique_feature_property')
        ]
    
    def clean(self):
        # Check if the property is already associated with a DiscountProperty
        if self.property and self.property.discounts.exists():
            raise ValidationError({"property": "The property is already in the discount list."})
    
    def increase_total_view_count(self):
        # Increasing view count by 1
        self.number_of_clicked += 1
        self.save()
    
    def increase_view_time(self, time_spent):
        # Increasing viewing time
        self.view_time += timedelta(seconds=time_spent)
        self.save()

