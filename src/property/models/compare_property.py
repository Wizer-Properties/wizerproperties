from django.db import models
from core.models import TimestampedModel


class CompareProperty(TimestampedModel):
    user = models.ForeignKey("user.User", on_delete=models.SET_NULL, null=True)
    property = models.ForeignKey("property.Property", on_delete=models.CASCADE, null=True)

    class Meta:
        verbose_name_plural = "compare properties"

    def __str__(self):
        return f"{self.user} - {self.property.title}"
