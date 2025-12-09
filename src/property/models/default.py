from django.utils import timezone
from django.db import models
from datetime import timedelta
from django.apps import apps
from core.models import TimestampedModel
from django.core.exceptions import ValidationError
from django.core.validators import MinValueValidator
from utils.general_data import UNIT_POSITION_TYPES
from user.models import User
from django.db.models import Sum
from django.utils.timezone import now
from utils.general_func import formatted_number



class Property(TimestampedModel):
    building = models.ForeignKey("building.Building", on_delete=models.SET_NULL, null=True, related_name="properties")
    unit_id = models.CharField(max_length=100, null=True)
    title = models.CharField(max_length=255, null=True)
    description = models.TextField(max_length=3000, null=True)
    price = models.PositiveIntegerField(default=0, null=True)
    price_per_sqm = models.DecimalField(
        max_digits=20, decimal_places=2, default=0, null=True, validators=[MinValueValidator(1)]
    )
    floor_number = models.CharField(max_length=255, null=True)
    unit_area = models.FloatField(default=0, null=True, validators=[MinValueValidator(1)])
    interior_view = models.URLField(max_length=2000, blank=True, null=True)
    number_of_bedroom = models.IntegerField(default=0, null=True, validators=[MinValueValidator(1)])
    number_of_bathroom = models.IntegerField(default=0, null=True, validators=[MinValueValidator(1)])
    number_of_balcony = models.IntegerField(default=0, null=True, validators=[MinValueValidator(1)])
    number_of_car_parking = models.IntegerField(default=0, null=True, validators=[MinValueValidator(1)])
    balcony_direction = models.CharField(max_length=255, null=True)
    main_door_direction = models.CharField(max_length=255, null=True)
    unit_position = models.CharField(max_length=100, choices=UNIT_POSITION_TYPES, null=True)
    
    # Using verbose_name to display clean field names in Django admin
    # Removes "have_" and "is_" prefixes to make admin interface more user-friendly
    # while keeping original field names in database for code compatibility
    have_tenant_occupied = models.BooleanField(default=False, verbose_name="Tenant Occupied")
    tenant_occupied_validity = models.DateField(blank=True, null=True)
    have_vacant = models.BooleanField(default=False, verbose_name="Vacant")
    have_owner_occupied = models.BooleanField(default=False, verbose_name="Owner Occupied")
    have_bathtub = models.BooleanField(default=False, verbose_name="Bathtub")
    have_duplex = models.BooleanField(default=False, verbose_name="Duplex")
    is_active = models.BooleanField(default=True, verbose_name="Active")
    created_by = models.ForeignKey("user.User", on_delete=models.SET_NULL, null=True, related_name="properties")
    view_time = models.DurationField(default=timedelta(seconds=0))  # How long the viewers view this property
    search_appearance = models.PositiveIntegerField(default=0)  # Number to time it appear in search
    male_visitors = models.PositiveIntegerField(default=0)  # Number of men visit this property
    female_visitors = models.PositiveIntegerField(default=0)  # Number of women visit this property

    class Meta:
        verbose_name_plural = "properties"

    def __str__(self):
        return str(self.title) if self.title else str(self.id)
    
    def get_absolute_url(self):
        from django.urls import reverse
        return reverse('property:get', args=[self.id])

    def clean(self):
        if self.tenant_occupied_validity and self.tenant_occupied_validity < timezone.now().date():
            raise ValidationError(
                {"tenant_occupied_validity": "Tenant occupied validity date must be greater than or equal to today."}
            )
    
    def manage_property_analytics(self, user=None, location=None) -> None:
        """Depending on view of a property we are upending it's associates analytical value"""
        
        if user and hasattr(user, "prospectprofile"):
            if user.prospectprofile.gender ==  "male":
                self.male_visitors += 1
            elif user.prospectprofile.gender ==  "female":
                self.female_visitors += 1
            
        self.save()
        self.update_visit_count()
        
        if location:
            # Creating Property visiting log
            PropertyVisitLog.objects.create(
                property=self,
                user_obj=user,
                location=location
            )

            # Saving property viewer location
            PropertyVisitorLocation = apps.get_model("property.PropertyVisitorLocation")
            property_viewer_location_obj, created = PropertyVisitorLocation.objects.get_or_create(
                property = self,
                address = location
            )
            property_viewer_location_obj.view_from_this_location += 1
            property_viewer_location_obj.save()
 

    # update how many user visited this property
    def update_visit_count(self):
        today = now().date()  # Get the current date
        click_logs_today = PropertyClicksLog.objects.filter(property=self, created_at__date=today)
        
        if click_logs_today.exists():
            # If click logs exist for today, update the count
            for click_log in click_logs_today:
                click_log.number_of_clicked += 1  # Increment the number_of_clicked by 1
                click_log.save()
        else:
            # If no click logs exist for today, create a new one
            PropertyClicksLog.objects.create(property=self, number_of_clicked=1)


    @property
    def format_price(self):
        return formatted_number(self.price)
    
    @property
    def format_price_per_sqm(self):
        return formatted_number(self.price_per_sqm)


class PropertyVisitLog(TimestampedModel):
    property = models.ForeignKey(Property, on_delete=models.SET_NULL, null=True)
    user_obj = models.ForeignKey(User, on_delete=models.SET_NULL, null=True, blank=True)
    location = models.CharField(max_length=500, null=True)


class PropertyClicksLog(TimestampedModel):
    property = models.ForeignKey(Property, on_delete=models.SET_NULL, null=True)
    number_of_clicked = models.PositiveIntegerField(default=0)