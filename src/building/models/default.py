from django.db import models
from django.core.exceptions import ValidationError
from django.core.validators import MinValueValidator
from utils.general_data import BUILDING_TYPES, BUILDING_STATUS, QUOTA_TYPES, FURNISHING_TYPES
from utils.helper_func import validate_max_current_year
from core.models import TimestampedModel


class Building(TimestampedModel):
    title = models.CharField(max_length=255, null=True)
    description = models.TextField(max_length=3000, null=True)
    lowest_price = models.DecimalField(
        max_digits=20, decimal_places=2, default=0, null=True, validators=[MinValueValidator(0)]
    )
    highest_price = models.DecimalField(
        max_digits=20, decimal_places=2, default=0, null=True, validators=[MinValueValidator(0)]
    )
    type = models.CharField(max_length=100, choices=BUILDING_TYPES, null=True)
    status = models.CharField(max_length=100, choices=BUILDING_STATUS, null=True)
    construction_year = models.IntegerField(
        default=2000, blank=True, null=True, validators=[MinValueValidator(2000), validate_max_current_year]
    )
    total_units_for_sale = models.IntegerField(default=0, null=True, validators=[MinValueValidator(0)])
    province = models.CharField(max_length=500, null=True)
    district = models.CharField(max_length=500, null=True)
    sub_district = models.CharField(max_length=500, null=True)
    address = models.CharField(max_length=500, null=True)
    latitude = models.FloatField(null=True)
    longitude = models.FloatField(null=True)
    project_total_area = models.FloatField(default=0, null=True, validators=[MinValueValidator(0)])
    total_floors = models.IntegerField(default=0, null=True, validators=[MinValueValidator(0)])
    quota = models.CharField(max_length=100, choices=QUOTA_TYPES, null=True)
    furnishing = models.CharField(max_length=100, choices=FURNISHING_TYPES, null=True)
    distance_from_location_to_BTS_or_MRT = models.DecimalField(
        max_digits=20, decimal_places=2, default=0, null=True, validators=[MinValueValidator(0)]
    )
    distance_from_location_to_ARL = models.DecimalField(
        max_digits=20, decimal_places=2, default=0, null=True, validators=[MinValueValidator(0)]
    )
    view = models.CharField(max_length=500, null=True)
    facility_view = models.URLField(max_length=2000, blank=True, null=True)
    location_view = models.URLField(max_length=2000, blank=True, null=True)
    have_freehold = models.BooleanField(default=False)
    have_leasehold = models.BooleanField(default=False)
    have_infinity_pool = models.BooleanField(default=False)
    have_pets_allowed = models.BooleanField(default=False)
    have_guard_house = models.BooleanField(default=False)
    have_sauna = models.BooleanField(default=False)
    have_sky_lounge = models.BooleanField(default=False)
    have_grocery = models.BooleanField(default=False)
    have_fitness_area = models.BooleanField(default=False)
    is_active = models.BooleanField(default=True)
    created_by = models.ForeignKey("user.User", on_delete=models.SET_NULL, null=True)

    def __str__(self):
        return str(self.title) if self.title else str(self.id)

    def clean(self):
        if self.lowest_price is not None and self.highest_price is not None:
            if self.lowest_price >= self.highest_price:
                raise ValidationError({"highest_price": "The highest price must be greater than the lowest price."})
