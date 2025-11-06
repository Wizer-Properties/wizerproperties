from django.db import models
from django.apps import apps
from datetime import timedelta
from django.contrib.contenttypes.models import ContentType
from django.core.exceptions import ValidationError
from core.models import TimestampedModel
from property.models import Property
from schedule.models import VisitingSchedule
from user.models import User
from utils.general_func import get_duration_without_milliseconds
from django.core.validators import MinValueValidator
from django.contrib.contenttypes.fields import GenericForeignKey
from django.db.models import Q


class Advertisement(TimestampedModel):
    TYPE_CHOICES = (
        ('home', 'Home'),
        ('search', 'Search'),
        ('details_topbar', 'Details Topbar'),
        ('details_sidebar', 'Details Sidebar'),
        ('blog', 'Blog'),
    )
    STATUS = (
        ('running', 'Active'),
        ('stopped', 'Inactive'),
    )

    ad_location = models.CharField(max_length=25, choices=TYPE_CHOICES, null=True)
    position = models.PositiveIntegerField(default=1, validators=[MinValueValidator(1)], help_text='Position of the advertisement in the ad location')
    banner = models.ImageField(upload_to='advertisement/banner/', null=True)
    status = models.CharField(max_length=25, choices=STATUS, default='running')

    # Generic relation to either Property or Building model. Both fields can be null.
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
    content_object = GenericForeignKey('content_type', 'object_id')  # renamed from `property` to `content`

    ad_run_duration = models.PositiveIntegerField(default=0, help_text='How many days this ad will run')
    number_of_clicked = models.PositiveIntegerField("Number of clicks", default=0)  # How many times this ad has been clicked
    view_time = models.DurationField(default=timedelta(seconds=0))  # How long the viewers view this advertisement
    expired_at = models.DateTimeField(null=True, blank=True) # When the ad is set to expire
        
    def __str__(self) -> str:
        return super().__str__()
    
    def clean(self):
        """To check some field validation manually we are modifying the default clean method"""
        
        error_messages = {} # Error messages will append here

        if self.content_type and not self.object_id:
            error_messages.update({'object_id': ['Object ID must be set if content type is specified']})
        
        if self.status == 'running':
            if Advertisement.objects.filter(ad_location=self.ad_location, position=self.position, status='running').exclude(id=self.id).exists():
                error_messages.update({'position': ['An advertisement with this ad location and position is already running']})
        
        # Raise validation errors if any
        if error_messages:
            raise ValidationError(error_messages)
    

    def save(self, *args, **kwargs):
        """Overriding save method to set expired_at field based on ad_run_duration"""

        # If content_type cleared, also clear object_id to avoid dangling references
        if not self.content_type:
            self.object_id = None
        
        # Call super().save() first to ensure created_at is set
        super().save(*args, **kwargs)
        
        if not self.expired_at and self.created_at:
            self.expired_at = self.created_at + timedelta(days=self.ad_run_duration)
            # Save again to update expired_at
            super().save(update_fields=['expired_at'])
    
    def end_at(self) -> str:
        """Returns Ad finishing time"""

        end_at = self.created_at + timedelta(days=self.ad_run_duration)
        return end_at
    
    def conversion_rate(self) -> float:
        """Returns advertisement conversion rate.
        For Property-targeted ads, computes VisitingSchedule count / clicks.
        Non-property targets return 0.0 for now.
        """
        if self.number_of_clicked == 0:
            return 0.0

        if not self.content_type or not self.object_id:
            return 0.0

        property_ct = ContentType.objects.get_for_model(Property)
        if self.content_type_id != property_ct.id:
            return 0.0

        visiting_schedule_count = VisitingSchedule.objects.filter(
            content_type=property_ct,
            object_id=self.object_id,
        ).count()
        return round((visiting_schedule_count / self.number_of_clicked) * 100, 2)

    def manage_ad_analytics(self, user=None, location=None) -> None:
        """Depending on view of an ad we are upending it's associates analytics value"""
        
        self.number_of_clicked += 1     # Increasing the ad click count
        self.save()
        if user and hasattr(user, "prospectprofile"):
            if user.prospectprofile.gender ==  "male":
                self.addemography.male_visitors += 1
            elif user.prospectprofile.gender ==  "female":
                self.addemography.female_visitors += 1
            
            self.addemography.save()
        if location:
            # Create AD log (generic to Property/Building or None)
            AdvertisementLog.objects.create(
                content_type=self.content_type,
                object_id=self.object_id,
                advertisement=self,
                user_obj=user,
                location=location,
            )

            # Saving ad viewer location (generic)
            AdViewerLocation = apps.get_model("advertise.AdViewerLocation")
            ad_viewer_location_obj, _ = AdViewerLocation.objects.get_or_create(
                advertisement=self,
                content_type=self.content_type,
                object_id=self.object_id,
                address=location,
            )
            ad_viewer_location_obj.view_from_this_location += 1
            ad_viewer_location_obj.save()
    
    def view_time_without_milliseconds(self):
        view_time = get_duration_without_milliseconds(self.view_time)
        return view_time
            

class AdvertisementLog(TimestampedModel):
    # Generic link to the target (Property or Building); both fields can be null
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
    user_obj = models.ForeignKey(User, on_delete=models.SET_NULL, null=True, blank=True)
    location = models.CharField(max_length=500, null=True)
