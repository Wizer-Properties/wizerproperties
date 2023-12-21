from django.utils import timezone
from django.db import models
from core.models import TimestampedModel
from django.core.exceptions import ValidationError
from django.core.validators import MinValueValidator
from utils.general_data import UNIT_POSITION_TYPES


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
    balcony_direction = models.CharField(max_length=255, null=True)
    main_door_direction = models.CharField(max_length=255, null=True)
    unit_position = models.CharField(max_length=100, choices=UNIT_POSITION_TYPES, null=True)
    have_access_to_BTS_or_MRT = models.BooleanField(default=False)
    have_access_to_ARL = models.BooleanField(default=False)
    have_tenant_occupied = models.BooleanField(default=False)
    tenant_occupied_validity = models.DateField(blank=True, null=True)
    have_vacant = models.BooleanField(default=False)
    have_owner_occupied = models.BooleanField(default=False)
    have_bathtub = models.BooleanField(default=False)
    have_duplex = models.BooleanField(default=False)
    newly_created = models.BooleanField(default=False)
    discount_period = models.DateField(blank=True, null=True)
    is_active = models.BooleanField(default=True)
    created_by = models.ForeignKey("user.User", on_delete=models.SET_NULL, null=True)

    class Meta:
        verbose_name_plural = "properties"

    def __str__(self):
        return str(self.title) if self.title else str(self.id)

    def clean(self):
        error_messages = {}

        if self.tenant_occupied_validity and self.tenant_occupied_validity < timezone.now().date():
            error_messages.update({"tenant_occupied_validity": "Date must be greater than or equal to today."})
        if self.discount_period and self.discount_period < timezone.now().date():
            error_messages.update({"discount_period": "Date must be greater than or equal to today."})

        if error_messages:
            raise ValidationError(error_messages)
