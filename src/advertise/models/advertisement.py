from django.db import models
from datetime import timedelta
from core.models import TimestampedModel
from property.models import Property


class Advertisement(TimestampedModel):
    TYPE_CHOICES = (
        ('home', 'Home'),
        ('search', 'Search'),
        ('details', 'Details')
    )

    type = models.CharField(max_length=25, choices=TYPE_CHOICES, null=True)
    position = models.PositiveIntegerField(default=0)
    property = models.ForeignKey(Property, on_delete=models.SET_NULL, null=True)
    run_time = models.DurationField(default=timedelta(seconds=0), help_text='In seconds')
    number_of_clicked = models.PositiveIntegerField(default=0)  # How many times this ad has been clicked
    view_time = models.DurationField(default=timedelta(seconds=0), help_text='In seconds')
        
    def __str__(self) -> str:
        return super().__str__()
