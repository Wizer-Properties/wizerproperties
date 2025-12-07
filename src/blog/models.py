from django.db import models
from core.models import TimestampedModel
from django_ckeditor_5.fields import CKEditor5Field
from datetime import timedelta
from user.models import User
from django.utils.text import slugify
import uuid
from django.core.exceptions import ValidationError


class Post(TimestampedModel):
    
    STATUS = (
        ('draft', 'Draft'),
        ('published', 'Published'),
        ('archived', 'Archived'),
    )
    
    slug = models.SlugField(unique=True, null=True, blank=True)
    title = models.CharField(max_length=250, null=True)
    status = models.CharField(max_length=20, default="draft", choices=STATUS)
    subtitle = models.CharField(max_length=2000, null=True)
    description = CKEditor5Field(null=True)
    creator = models.ForeignKey(
        User,
        on_delete=models.CASCADE,
        limit_choices_to={'is_superuser': True}
    )
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
    
    def get_absolute_url(self):
        from django.urls import reverse
        return reverse('blogs:blog_details', args=[self.slug])

    def clean(self):
        # import here to avoid changing top-of-file imports
        super().clean()
        if self.creator and not self.creator.is_superuser:
            raise ValidationError({'creator': 'Creator must be an admin user.'})
    
    def save(self, *args, **kwargs):
        # validate that creator is superuser (and other field validation)
        self.full_clean()

        # estimate read time (guard if description is None)
        self.estimated_read_time = round(len((self.description or '').split()) / 200)

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

    class Meta:
        verbose_name_plural = "Categories"

    def __str__(self):
        return self.name

class PostInteraction(TimestampedModel):
    INTERACTION_TYPES = (
        ('like', 'Like'),
        ('dislike', 'Dislike'),
    )
    
    post = models.ForeignKey(Post, on_delete=models.CASCADE, related_name='interactions')
    user = models.ForeignKey(User, on_delete=models.CASCADE, null=True, blank=True)
    ip_address = models.GenericIPAddressField(null=True, blank=True)
    interaction_type = models.CharField(max_length=10, choices=INTERACTION_TYPES)

    def __str__(self):
        identifier = self.user.username if self.user else self.ip_address
        interaction = 'liked' if self.interaction_type == 'like' else 'disliked'
        return f"{identifier} - {self.post.title} - {interaction}"
