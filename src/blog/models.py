from django.db import models
from core.models import TimestampedModel
from django_ckeditor_5.fields import CKEditor5Field
from datetime import timedelta
from user.models import User
from django.utils.text import slugify
import uuid


class Post(TimestampedModel):
    
    STATUS = (
        ('draft', 'Draft'),
        ('published', 'Published'),
        ('archived', 'Archived'),
    )
    
    slug = models.SlugField(unique=True, null=True, blank=True)
    title = models.CharField(max_length=250, null=True)
    status = models.CharField(max_length=20, default="draft", choices=STATUS)
    subtitle = models.CharField(max_length=200, null=True)
    description = CKEditor5Field(null=True)
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
        self.estimated_read_time = round(len(self.description.split()) / 200)
        
        if not self.slug:
            base_slug = slugify(self.title[:40])
            unique_slug = base_slug
            while Post.objects.filter(slug=unique_slug).exists():
                unique_slug = f"{base_slug}-{str(uuid.uuid4())[:5]}"
            self.slug = unique_slug
        
        super().save(*args, **kwargs)


class Category(TimestampedModel):
    name = models.CharField(max_length=250, null=True)
    is_active = models.BooleanField(default=True)

    def __str__(self):
        return self.name
