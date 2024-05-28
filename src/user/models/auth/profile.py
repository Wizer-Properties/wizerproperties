from django.db import models
from phonenumber_field.modelfields import PhoneNumberField
from core.models import TimestampedModel
from utils.general_data import GENDER
from .user import User


class Profile(TimestampedModel):
    user = models.OneToOneField(User, on_delete=models.CASCADE)
    phone_number = PhoneNumberField(null=True)

    class Meta:
        abstract = True

    def __str__(self):
        return str(self.user)


class CompanyProfile(Profile):
    company_logo = models.ImageField(max_length=1000, null=True)
    company_name = models.CharField(max_length=100, null=True)
    company_address = models.CharField(max_length=500, null=True)
    company_details = models.CharField(max_length=2000, null=True)
    whats_app_link = models.URLField(max_length=2000, blank=True, null=True)
    line_link = models.URLField(max_length=2000, blank=True, null=True)
    we_chat_link = models.URLField(max_length=2000, blank=True, null=True)

    class Meta:
        abstract = True


class DeveloperProfile(CompanyProfile):
    pass


class AgentProfile(CompanyProfile):
    pass


class ProspectProfile(Profile):
    first_name = models.CharField(max_length=100)
    last_name = models.CharField(max_length=100)
    gender = models.CharField(max_length=50, choices=GENDER, null=True)
    address = models.CharField(max_length=2000, null=True)
