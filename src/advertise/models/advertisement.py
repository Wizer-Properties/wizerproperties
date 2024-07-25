from django.db import models
from django.apps import apps
from datetime import timedelta
from django.contrib.contenttypes.models import ContentType
from django.core.exceptions import ValidationError
from core.models import TimestampedModel
from property.models import Property
from schedule.models import VisitingSchedule
from user.models import User


class Advertisement(TimestampedModel):
    TYPE_CHOICES = (
        ('home', 'Home'),
        ('search', 'Search'),
        ('details', 'Details')
    )
    STATUS = (
        ('running', 'Running'),
        ('stopped', 'Stopped'),
    )

    type = models.CharField(max_length=25, choices=TYPE_CHOICES, null=True)
    position = models.PositiveIntegerField(default=0)
    status = models.CharField(max_length=25, choices=STATUS, default='running')
    property = models.ForeignKey(Property, on_delete=models.CASCADE)
    ad_run_duration = models.PositiveIntegerField(default=0, help_text='How many days this ad will run')
    number_of_clicked = models.PositiveIntegerField(default=0)  # How many times this ad has been clicked
    view_time = models.DurationField(default=timedelta(seconds=0))  # How long the viewers view this advertisement
        
    def __str__(self) -> str:
        return super().__str__()
    
    def clean(self):
        """To check some field validation manually we are modifying the default clean method"""
        
        error_messages = {} # Error messages will append here
        
        if self.status == 'running':
            if Advertisement.objects.filter(type=self.type, position=self.position, status='running').exclude(id=self.id).exists():
                error_messages.update({'position': ['An advertisement with this type and position is already running']})
        
        # Raise validation errors if any
        if error_messages:
            raise ValidationError(error_messages)
    
    def end_at(self) -> str:
        """Returns Ad finishing time"""

        end_at = self.created_at + timedelta(days=self.ad_run_duration)
        return end_at
    
    def conversion_rate(self) -> float:
        """Returns advertisement conversion rate"""

        if self.number_of_clicked == 0:
            return 0.0
        
        property_content_type = ContentType.objects.get_for_model(Property)
        # Filter VisitingSchedule objects for the specific property
        visiting_schedule_count = VisitingSchedule.objects.filter(
            content_type=property_content_type,
            object_id=self.property.id
        ).count()
        conversion_rate = round((visiting_schedule_count/self.number_of_clicked) * 100, 2)
        
        return conversion_rate

    def manage_ad_analytics(self, user=None, location=None) -> None:
        """Depending on view of an ad we are upending it's associates analytics value"""
        
        self.number_of_clicked += 1     # Increasing the ad click count
        self.save()
        
        # Creating AD log
        AdvertisementLog.objects.create(
            property=self.property,
            advertisement=self,
            user_obj=user,
            location=location
        )
        
        if user and hasattr(user, "prospectprofile"):
            if user.prospectprofile.gender ==  "male":
                self.addemography.male_visitors += 1
            elif user.prospectprofile.gender ==  "female":
                self.addemography.female_visitors += 1
            
            self.addemography.save()
        
        AdViewerLocation = apps.get_model("advertise.AdViewerLocation")
        ad_viewer_location_obj, created = AdViewerLocation.objects.get_or_create(
            property = self.property,
            advertisement = self,
            address = location
        )
        ad_viewer_location_obj.view_from_this_location += 1
        ad_viewer_location_obj.save()
            

class AdvertisementLog(TimestampedModel):
    property = models.ForeignKey(Property, on_delete=models.SET_NULL, null=True)
    advertisement = models.ForeignKey(Advertisement, on_delete=models.SET_NULL, null=True)
    user_obj = models.ForeignKey(User, on_delete=models.SET_NULL, null=True, blank=True)
    location = models.CharField(max_length=500, null=True)
