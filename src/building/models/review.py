from typing import Any
from django.db import models
from django.conf import settings
from django.core.exceptions import ValidationError
from core.models import TimestampedModel
from .default import Building


class BuildingReview(TimestampedModel):
    RATING_CHOICES = (
        (1, "1"),
        (2, "2"),
        (3, "3"),
        (4, "4"),
        (5, "5"),
    )

    user = models.ForeignKey(settings.AUTH_USER_MODEL, on_delete=models.SET_NULL, null=True, related_name="building_reviews")
    building = models.ForeignKey(Building, on_delete=models.CASCADE, null=True, related_name="reviews")
    rating = models.IntegerField(choices=RATING_CHOICES, default=0)
    review_text = models.TextField(blank=True, default="", max_length=1000)
    is_active = models.BooleanField(default=True)

    def __str__(self) -> str:
        username = self.user.username if self.user else "Anonymous"
        return f"{username} - {self.building} - {self.rating}"

    def clean(self) -> None:
        super().clean()

        # Duplication check
        is_exists = BuildingReview.objects.filter(
            user=self.user,
            building=self.building,
        ).exists()
        if is_exists:
            raise ValidationError("This building has been previously reviewed.")
