from django.db import models


class TimestampedModel(models.Model):
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)
    
    class Meta:
        abstract = True


class Contact(TimestampedModel):
    
    STATUS = (
        ('read', 'Read'),
        ('unread', 'Unread'),
    )
    
    email = models.EmailField(max_length=100, null=True)
    subject = models.CharField(max_length=500, null=True)
    body = models.TextField(null=True)
    status = models.CharField(max_length=20, default="unread", choices=STATUS)
    
    def __str__(self):
        return str(self.subject)
