from django.db import models
from core.models import TimestampedModel
from django.core.validators import MinValueValidator


class Property(TimestampedModel):
    building = models.ForeignKey("building.Building", on_delete=models.SET_NULL, null=True)
    unit_id = models.CharField(max_length=100, null=True)
    title = models.CharField(max_length=255, null=True)
    description = models.TextField(max_length=3000, null=True)
    price = models.DecimalField(
        max_digits=20, decimal_places=2, default=0, null=True, validators=[MinValueValidator(1)]
    )
    price_per_sqm = models.DecimalField(
        max_digits=20, decimal_places=2, default=0, null=True, validators=[MinValueValidator(1)]
    )
    floor_number = models.CharField(max_length=255, null=True)
    unit_area = models.FloatField(default=0, null=True, validators=[MinValueValidator(1)])
    number_of_bedroom = models.IntegerField(default=0, null=True, validators=[MinValueValidator(1)])
    number_of_bathroom = models.IntegerField(default=0, null=True, validators=[MinValueValidator(1)])
    number_of_balcony = models.IntegerField(default=0, null=True, validators=[MinValueValidator(1)])
    number_of_car_parking = models.IntegerField(default=0, null=True, validators=[MinValueValidator(1)])
    is_active = models.BooleanField(default=True)
    created_by = models.ForeignKey("user.User", on_delete=models.SET_NULL, null=True)

    class Meta:
        verbose_name_plural = "properties"

    def __str__(self):
        return str(self.title) if self.title else str(self.id)
