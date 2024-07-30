from django.db import models
from core.models import TimestampedModel
from property.models import Property


class PropertyVisitorLocation(TimestampedModel):
    property = models.ForeignKey(Property, on_delete=models.SET_NULL, null=True)
    address = models.CharField(max_length=500, null=True)
    view_from_this_location = models.IntegerField(default=0)


class PropertyPriceRange(TimestampedModel):
    range = models.CharField(max_length=50, unique=True)
    search_appearance = models.PositiveIntegerField(default=0) # Number of time it used while searching
