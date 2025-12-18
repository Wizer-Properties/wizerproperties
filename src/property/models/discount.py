from typing import Any, ClassVar
from django.db import models
from django.conf import settings
from django.utils import timezone
from django.core.exceptions import ValidationError
from datetime import timedelta

from core.models import TimestampedModel
from property.models import Property


class DiscountProperty(TimestampedModel):
    property = models.ForeignKey(Property, null=True, on_delete=models.SET_NULL, related_name="discounts")
    period = models.DateField(null=True, verbose_name="Expiry Date")
    number_of_clicked = models.PositiveIntegerField(default=0)  # How many times user has view this property
    view_time = models.DurationField(default=timedelta(seconds=0))  # How long the viewers view this property
    created_by = models.ForeignKey(settings.AUTH_USER_MODEL, on_delete=models.SET_NULL, null=True, related_name="discount_properties")

    class Meta:
        verbose_name_plural = "Discount properties"
        constraints: ClassVar[list[Any]] = [
            models.UniqueConstraint(fields=['property'], name='unique_discount_property')
        ]

    def clean(self) -> None:        
        error_messages: dict[str, str] = {}     # Error message will append here

        # Check if the property is already associated with a FeatureProperty
        if self.property and self.property.features.exists():
            error_messages.update({"property": "The property is already in the feature list."})

        # Period will be future date
        if self.period and self.period < timezone.now().date():
            error_messages.update({"period": "Period date must be greater than or equal to today."})
        
        if error_messages:
            raise ValidationError(error_messages)
    
    def duration_without_microseconds(self) -> str:
        if self.view_time:
            # Remove microseconds by subtracting them
            duration_without_microseconds = self.view_time - timedelta(microseconds=self.view_time.microseconds)
            return str(duration_without_microseconds)
        return "0:00:00"
    
    def increase_total_view_count(self) -> None:
        # Increasing view count by 1
        self.number_of_clicked += 1
        self.save()
    
    def increase_view_time(self, time_spent: int) -> None:
        # Increasing viewing time
        self.view_time += timedelta(seconds=time_spent)
        self.save()
