from django.db import models
from core.models import TimestampedModel
from advertise.models import Advertisement
from property.models import Property


class AdDemography(TimestampedModel):
    advertisement = models.OneToOneField(Advertisement, on_delete=models.CASCADE)
    male_visitors = models.PositiveIntegerField(default=0)
    female_visitors = models.PositiveIntegerField(default=0)

    class Meta:
        verbose_name_plural = "Advertisement Demographies"


class AdViewerLocation(TimestampedModel):
    property = models.ForeignKey(Property, on_delete=models.SET_NULL, null=True)
    advertisement = models.ForeignKey(Advertisement, on_delete=models.SET_NULL, null=True)
    address = models.CharField(max_length=500, null=True)
    view_from_this_location = models.IntegerField(default=0)

    class Meta:
        verbose_name_plural = "Advertisement Viewer Locations"
