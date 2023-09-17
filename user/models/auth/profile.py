from django.db import models
from phonenumber_field.modelfields import PhoneNumberField
from core.models import TimestampedModel
from utils.general_data import GENDER
from .user import User
from utils.general_data import UNIQUE_PROFILE_EMAIL_MESSAGE


class DeveloperProfile(TimestampedModel):
    user = models.OneToOneField(User, on_delete=models.CASCADE)
    email = models.EmailField(
        db_collation="case_insensitive",
        unique=True,
        null=True,
        error_messages={"unique": UNIQUE_PROFILE_EMAIL_MESSAGE},
    )
    phone_number = PhoneNumberField(null=True)
    company_logo = models.ImageField(max_length=1000, null=True, upload_to="developer_profile_company_logo/")
    company_name = models.CharField(max_length=100, null=True)
    company_address = models.CharField(max_length=500, null=True)
    company_details = models.CharField(max_length=2000, null=True)

    def __str__(self):
        return str(self.user)


class AgentProfile(TimestampedModel):
    user = models.OneToOneField(User, on_delete=models.CASCADE)
    email = models.EmailField(
        db_collation="case_insensitive",
        unique=True,
        null=True,
        error_messages={"unique": UNIQUE_PROFILE_EMAIL_MESSAGE},
    )
    phone_number = PhoneNumberField(null=True)
    company_logo = models.ImageField(max_length=1000, null=True, upload_to="agent_profile_company_logo/")
    company_name = models.CharField(max_length=100, null=True)
    company_address = models.CharField(max_length=500, null=True)
    company_details = models.CharField(max_length=2000, null=True)

    def __str__(self):
        return str(self.user)


class ProspectProfile(TimestampedModel):
    user = models.OneToOneField(User, on_delete=models.CASCADE)
    first_name = models.CharField(max_length=100)
    last_name = models.CharField(max_length=100)
    email = models.EmailField(
        db_collation="case_insensitive",
        unique=True,
        null=True,
        error_messages={"unique": UNIQUE_PROFILE_EMAIL_MESSAGE},
    )
    phone_number = PhoneNumberField(null=True)
    picture = models.ImageField(max_length=1000, null=True, upload_to="prospect_profile_picture/")
    gender = models.CharField(max_length=50, choices=GENDER, null=True)
    address = models.CharField(max_length=2000, null=True)

    def __str__(self):
        return str(self.user)
