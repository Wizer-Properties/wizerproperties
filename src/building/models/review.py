from django.db import models
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

    user = models.ForeignKey("user.User", on_delete=models.SET_NULL, null=True, related_name="building_reviews")
    building = models.ForeignKey(Building, on_delete=models.CASCADE, null=True, related_name="reviews")
    rating = models.IntegerField(choices=RATING_CHOICES, default=0)
    review_text = models.TextField(blank=True, null=True, max_length=1000)
    is_active = models.BooleanField(default=True)

    def clean(self, *args, **kwargs):
        super().clean()

        # Duplication check
        is_exists = BuildingReview.objects.filter(
            user=self.user,
            building=self.building,
        ).exists()
        if is_exists:
            raise ValidationError("This building has been previously reviewed.")
