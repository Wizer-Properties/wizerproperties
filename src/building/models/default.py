from django.db import models
from django.core.exceptions import ValidationError
from django.core.validators import MinValueValidator
from utils.general_data import (
    BUILDING_TYPES,
    COMMERCIAL_SUB_TYPES,
    RESIDENCE_SUB_TYPES,
    BUILDING_STATUS,
    QUOTA_TYPES,
    FURNISHING_TYPES,
)
from utils.helper_func import validate_max_current_year
from core.models import TimestampedModel
from utils.general_func import formatted_number

class Building(TimestampedModel):
    title = models.CharField(max_length=255, null=True)
    description = models.TextField(max_length=3000, null=True)
    lowest_price = models.PositiveIntegerField(default=0, null=True)
    highest_price = models.PositiveIntegerField(default=0, null=True)
    type = models.CharField(max_length=100, choices=BUILDING_TYPES, null=True)
    sub_type = models.CharField(
        max_length=100,
        choices=RESIDENCE_SUB_TYPES + COMMERCIAL_SUB_TYPES,
        blank=True,
        null=True,
        help_text="Select a sub type based on the selected type.",
    )
    status = models.CharField(max_length=100, choices=BUILDING_STATUS, null=True)
    construction_year = models.IntegerField(
        default=2000, blank=True, null=True, validators=[MinValueValidator(2000), validate_max_current_year]
    )
    total_units_for_sale = models.IntegerField(default=0, null=True, validators=[MinValueValidator(0)])
    province = models.CharField(max_length=500, null=True)
    district = models.CharField(max_length=500, null=True)
    sub_district = models.CharField(max_length=500, blank=True, null=True)
    address = models.CharField(max_length=500, null=True)
    latitude = models.FloatField(null=True)
    longitude = models.FloatField(null=True)
    project_total_area = models.FloatField(default=0, null=True, validators=[MinValueValidator(0)])
    total_floors = models.IntegerField(default=0, null=True, validators=[MinValueValidator(0)])
    quota = models.CharField(max_length=100, choices=QUOTA_TYPES, null=True)
    furnishing = models.CharField(max_length=100, choices=FURNISHING_TYPES, null=True)
    distance_from_location_to_BTS_or_MRT = models.DecimalField(
        max_digits=20, decimal_places=2, default=0, null=True, validators=[MinValueValidator(0)],
        verbose_name="Distance from location to BTS or MRT (KM)"
    )
    distance_from_location_to_ARL = models.DecimalField(
        max_digits=20, decimal_places=2, default=0, null=True, validators=[MinValueValidator(0)],
        verbose_name="Distance from location to ARL (KM)"
    )
    view = models.CharField(max_length=500, null=True)
    facility_view = models.URLField(max_length=2000, blank=True, null=True)
    location_view = models.URLField(max_length=2000, blank=True, null=True)
    
    # Using verbose_name to display clean field names in Django admin
    # Removes "have_" and "is_" prefixes to make admin interface more user-friendly
    # while keeping original field names in database for code compatibility
    have_freehold = models.BooleanField(default=False, verbose_name="Freehold")
    have_leasehold = models.BooleanField(default=False, verbose_name="Leasehold")
    have_infinity_pool = models.BooleanField(default=False, verbose_name="Infinity Pool")
    have_pets_allowed = models.BooleanField(default=False, verbose_name="Pets Allowed")
    have_guard_house = models.BooleanField(default=False, verbose_name="Guard House")
    have_sauna = models.BooleanField(default=False, verbose_name="Sauna")
    have_sky_lounge = models.BooleanField(default=False, verbose_name="Sky Lounge")
    have_grocery = models.BooleanField(default=False, verbose_name="Grocery")
    have_fitness_area = models.BooleanField(default=False, verbose_name="Fitness Area")
    is_active = models.BooleanField(default=True, verbose_name="Active")
    created_by = models.ForeignKey("user.User", on_delete=models.SET_NULL, null=True)

    def __str__(self):
        return str(self.title) if self.title else str(self.id)
    
    def get_absolute_url(self):
        from django.urls import reverse
        return reverse('building:get', args=[self.id])

    def clean(self):
        error_messages = {}

        # Ensure lowest_price is less than highest_price
        if self.lowest_price is not None and self.highest_price is not None:
            if self.lowest_price >= self.highest_price:
                error_messages.update({"highest_price": ["The highest price must be greater than the lowest price."]})

        # Validate sub_type based on the selected type
        if self.type:
            if self.type == "residence":
                # Check if sub_type is one of the valid residence sub-types
                if self.sub_type not in dict(RESIDENCE_SUB_TYPES).keys():
                    error_messages.update(
                        {
                            "sub_type": [
                                f"Please select one of the following: {', '.join(dict(RESIDENCE_SUB_TYPES).values())}."
                            ]
                        }
                    )
            elif self.type == "commercial":
                # Check if sub_type is one of the valid commercial sub-types
                if self.sub_type not in dict(COMMERCIAL_SUB_TYPES).keys():
                    error_messages.update(
                        {
                            "sub_type": [
                                f"Please select one of the following: {', '.join(dict(COMMERCIAL_SUB_TYPES).values())}."
                            ]
                        }
                    )

        # Raise validation errors if any
        if error_messages:
            raise ValidationError(error_messages)
        

    def formatted_highest_price(self):
        return formatted_number(self.highest_price)
    
    def formatted_lowest_price(self):
        return formatted_number(self.lowest_price)
