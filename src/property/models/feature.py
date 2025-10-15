from django.db import models
from django.core.exceptions import ValidationError
from datetime import timedelta

from core.models import TimestampedModel
from property.models import Property


class FeatureProperty(TimestampedModel):
    property = models.ForeignKey(Property, null=True, on_delete=models.SET_NULL, related_name="features")
    number_of_clicked = models.PositiveIntegerField(default=0)  # How many times user has view this property
    view_time = models.DurationField(default=timedelta(seconds=0))  # How long the viewers view this property
    expiry_date = models.DateField(null=True, verbose_name="Expiry Date")
    created_by = models.ForeignKey("user.User", on_delete=models.SET_NULL, null=True, related_name="featured_properties")

    class Meta:
        verbose_name_plural = "Feature properties"
        constraints = [
            models.UniqueConstraint(fields=['property'], name='unique_feature_property')
        ]
    
    def clean(self):
        # Check if the property is already associated with a DiscountProperty
        if self.property and self.property.discounts.exists():
            raise ValidationError({"property": "The property is already in the discount list."})
    
    def duration_without_microseconds(self):
        if self.view_time:
            # Remove microseconds by subtracting them
            duration_without_microseconds = self.view_time - timedelta(microseconds=self.view_time.microseconds)
            return str(duration_without_microseconds)
        return "0:00:00"
    
    def increase_total_view_count(self):
        # Increasing view count by 1
        self.number_of_clicked += 1
        self.save()
    
    def increase_view_time(self, time_spent):
        # Increasing viewing time
        self.view_time += timedelta(seconds=time_spent)
        self.save()

