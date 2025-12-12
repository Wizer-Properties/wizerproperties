from django.db import models
from django.core.exceptions import ValidationError

from core.models import TimestampedModel
from user.models import ProspectProfile


class SavedSearch(TimestampedModel):
    """
    Model to store saved property search criteria for prospects.
    Allows users to save their search filters and quickly access them later.
    """
    prospect = models.ForeignKey(
        ProspectProfile,
        on_delete=models.CASCADE,
        related_name="saved_searches",
        help_text="The prospect who saved this search"
    )
    name = models.CharField(
        max_length=200,
        help_text="User-friendly name for this saved search (e.g., '2BR Condos in Sukhumvit')"
    )
    search_params = models.JSONField(
        default=dict,
        help_text="JSON object containing all search parameters (filters, place, ordering, etc.)"
    )
    is_active = models.BooleanField(
        default=True,
        help_text="Whether this saved search is active (users can deactivate without deleting)"
    )

    class Meta:
        verbose_name = "Saved Search"
        verbose_name_plural = "Saved Searches"
        ordering = ["-created_at"]
        unique_together = [["prospect", "name"]]

    def __str__(self) -> str:
        return f"{self.prospect.user.email} - {self.name}"

    def clean(self) -> None:
        """Validate that search_params is a dictionary."""
        super().clean()
        if not isinstance(self.search_params, dict):
            raise ValidationError("search_params must be a dictionary")

