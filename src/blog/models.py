from django.db import models
from core.models import TimestampedModel
from ckeditor.fields import RichTextField
from datetime import timedelta
from user.models import User


class Post(TimestampedModel):
    
    STATUS = (
        ('draft', 'Draft'),
        ('published', 'Published'),
        ('archived', 'Archived'),
    )
    
    title = models.CharField(max_length=250, null=True)
    status = models.CharField(max_length=20, default="draft", choices=STATUS)
    subtitle = models.CharField(max_length=250, null=True)
    description = RichTextField(null=True)
    creator = models.ForeignKey(User, on_delete=models.CASCADE)
    banner_image = models.ImageField(upload_to='blog/banner_images/', null=True)
    categories = models.ManyToManyField('Category', related_name='posts')
    estimated_read_time = models.IntegerField(default=0)
    total_read_time = models.DurationField(default=timedelta(seconds=0))
    total_read_count = models.IntegerField(default=0)
    total_likes = models.IntegerField(default=0)
    total_dislikes = models.IntegerField(default=0)
    
    class Meta:
        ordering = ['-created_at']

    def __str__(self):
        return self.title
    
    def save(self, *args, **kwargs):
        self.estimated_read_time = len(self.description.split()) / 200
        super().save(*args, **kwargs)


class Category(TimestampedModel):
    name = models.CharField(max_length=250, null=True)
    is_active = models.BooleanField(default=True)

    def __str__(self):
        return self.name
