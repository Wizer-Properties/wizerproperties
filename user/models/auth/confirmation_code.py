from django.db import models
from django.conf import settings
from django.utils import timezone
from user.models.auth import User
from core.models import TimestampedModel


class ConfirmationCodeManager(models.Manager):
    def get_queryset(self):
        return super().get_queryset().filter(is_valid=True, expiration_date__gte=timezone.now())


class ConfirmationCode(TimestampedModel):
    CODE_TYPE = (("account_verification", "Account verification"),)

    user = models.ForeignKey(User, on_delete=models.CASCADE)
    code = models.CharField(max_length=100)
    code_type = models.CharField(max_length=50)
    is_valid = models.BooleanField(default=True)
    expiration_date = models.DateTimeField(null=True)

    objects = ConfirmationCodeManager()

    def __str__(self):
        return self.code

    def save(self, *args, **kwargs):
        # Set the expiration date when a confirmation code is created or updated
        if not self.expiration_date:
            self.expiration_date = timezone.now() + timezone.timedelta(
                days=settings.CONFIRMATION_CODE_EXPIRATION_DAYS
            )  # Adjust the expiration period as needed
        super().save(*args, **kwargs)
