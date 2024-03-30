from django.db import models
from core.models import TimestampedModel
from ckeditor.fields import RichTextField


class Reel(TimestampedModel):
    SOCIAL_MEDIA_CHOICES = (
        ("youtube", "Youtube"),
        ("titTok", "TitTok"),
        ("instagram", "Instagram"),
    )
    CATEGORY_CHOICES = (
        ("advice", "Advice"),
        ("info", "Info"),
        ("tour", "Tour"),
    )
    STATUS_CHOICES = (
        ("active", "Active"),
        ("inactive", "Inactive"),
    )

    url = models.URLField(max_length=2000, null=True)
    social_media = models.CharField(max_length=30, choices=SOCIAL_MEDIA_CHOICES, null=True)
    category = models.CharField(max_length=30, choices=CATEGORY_CHOICES, null=True)
    status = models.CharField(max_length=30, default="active")
    details = models.TextField(max_length=3000, null=True, blank=True)
    created_by = models.ForeignKey("user.User", on_delete=models.SET_NULL, null=True)

    def __str__(self):
        return str(self.id)
