from django.db import models
from phonenumber_field.modelfields import PhoneNumberField
from core.models import TimestampedModel
from utils.general_data import GENDER
from .user import User


class Profile(TimestampedModel):
    user = models.OneToOneField(User, on_delete=models.CASCADE)
    phone_number = PhoneNumberField(null=True)
    address = models.CharField(max_length=500, null=True)
    latitude = models.FloatField(null=True)
    longitude = models.FloatField(null=True)

    class Meta:
        abstract = True

    def __str__(self):
        return str(self.user)


class DeveloperOrAgentMixin(Profile):
    company_logo = models.ImageField(max_length=1000, null=True, upload_to="developer_or_agent_company_logo/")
    company_name = models.CharField(max_length=100, null=True)
    company_details = models.CharField(max_length=2000, null=True)
    whats_app_link = models.URLField(max_length=2000, blank=True, null=True)
    line_link = models.URLField(max_length=2000, blank=True, null=True)
    we_chat_link = models.URLField(max_length=2000, blank=True, null=True)
    credit_balance = models.DecimalField(max_digits=10, decimal_places=2, default=0)

    class Meta:
        abstract = True



class DeveloperProfile(DeveloperOrAgentMixin):
    pass


class AgentProfile(DeveloperOrAgentMixin):
    pass


class ProspectProfile(Profile):
    first_name = models.CharField(max_length=100)
    last_name = models.CharField(max_length=100)
    gender = models.CharField(max_length=50, choices=GENDER, null=True)
