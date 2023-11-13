from django.db import models
from django.core.exceptions import ValidationError
from core.models import TimestampedModel


class CompareProperty(TimestampedModel):
    user = models.ForeignKey("user.User", on_delete=models.SET_NULL, null=True)
    property = models.ForeignKey("property.Property", on_delete=models.CASCADE, null=True)

    class Meta:
        verbose_name_plural = "compare properties"

    def __str__(self):
        return f"{self.user} - {self.property.title}"

    def clean(self):
        # Check if there is already an object with the same user and property
        existing_objects = self.__class__.objects.filter(user=self.user, property=self.property)
        if self.id:
            existing_objects = existing_objects.exclude(id=self.id)  # Exclude the current object for updates

        if existing_objects.exists():
            raise ValidationError("A comparison already exists for this user and property.")
