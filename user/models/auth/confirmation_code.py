from django.db import models

from user.models.auth import User
from core.models import TimestampedModel


class ConfirmationCodeManager(models.Manager):
    def get_queryset(self):
        return super().get_queryset().filter(is_valid=False)
    

class ConfirmationCode(TimestampedModel):
    
    CODE_TYPE = (
        ("account_verification", "Account verification"),
    )
    
    user = models.ForeignKey(User, on_delete=models.CASCADE)
    code = models.CharField(max_length=100)
    code_type = models.CharField(max_length=50)
    is_valid = models.BooleanField(default=True)
    
    objects = ConfirmationCodeManager()
    
    def __str__(self):
        return self.code
    