from django.db import models
from django.db.models import Q
from django.contrib.contenttypes.models import ContentType
from django.contrib.contenttypes.fields import GenericForeignKey
from core.models import TimestampedModel
from advertise.models import Advertisement


class AdDemography(TimestampedModel):
    advertisement = models.OneToOneField(Advertisement, on_delete=models.CASCADE)
    male_visitors = models.PositiveIntegerField(default=0)
    female_visitors = models.PositiveIntegerField(default=0)

    class Meta:
        verbose_name_plural = "Advertisement Demographic"


class AdViewerLocation(TimestampedModel):
    # Generic target (Property or Building). Both can be null for orphan ads.
    content_type = models.ForeignKey(
        ContentType,
        on_delete=models.SET_NULL,
        null=True,
        blank=True,
        limit_choices_to=Q(
            Q(app_label='building', model='building') |
            Q(app_label='property', model='property')
        )
    )
    object_id = models.PositiveIntegerField(null=True, blank=True)
    content_object = GenericForeignKey('content_type', 'object_id')

    advertisement = models.ForeignKey(Advertisement, on_delete=models.SET_NULL, null=True)
    address = models.CharField(max_length=500, null=True)
    view_from_this_location = models.IntegerField(default=0)

    class Meta:
        verbose_name_plural = "Advertisement Viewer Locations"
