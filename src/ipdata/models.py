from django.db import models
from core.models import TimestampedModel


class IPData(TimestampedModel):
    ip = models.CharField(max_length=100, unique=True)
    address = models.CharField(max_length=500, null=True)
    last_time_checked_by_proxycheck =  models.DateTimeField(null=True, blank=True)
    
    def __str__(self) -> str:
        return str(self.ip)
