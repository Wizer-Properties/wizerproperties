from django.db import models
from django.contrib.auth.models import AbstractUser, BaseUserManager
from django.contrib.postgres.fields import CIEmailField

from core.models import TimestampedModel
    
class UserManager(BaseUserManager):
    use_in_migrations = True

    def _create_user(self, email, password, **extra_fields):
        # Create and save a User with the given email and password.

        if not email:
            raise ValueError(_('The given email must be set'))
        email = self.normalize_email(email)
        
        user = self.model(email=email, **extra_fields)
        user.set_password(password)
        user.save(using=self._db)
        return user

    def create_user(self, email, password=None, **extra_fields):
        extra_fields.setdefault('is_staff', False)
        extra_fields.setdefault('is_superuser', False)
        return self._create_user(email, password, **extra_fields)

    def create_superuser(self, email, password, **extra_fields):
        # Create and save a SuperUser with the given email and password.
        
        extra_fields.setdefault('is_staff', True)
        extra_fields.setdefault('is_superuser', True)

        if extra_fields.get('is_staff') is not True:
            raise ValueError('Superuser must have is_staff=True.')
        if extra_fields.get('is_superuser') is not True:
            raise ValueError('Superuser must have is_superuser=True.')

        return self._create_user(email, password, **extra_fields)


    def get_by_natural_key(self, email):
        # for user id(email) case insensitive
        case_insensitive_username_field = '{}__iexact'.format(self.model.USERNAME_FIELD)
        return self.get(**{case_insensitive_username_field: email})	


class User(TimestampedModel, AbstractUser):
    USERNAME_FIELD = 'email'
    REQUIRED_FIELDS = []
    
    USER_TYPE = (
        ('developer', 'Developer'),
        ('agent', 'Agent'),
        ('prospect', 'Prospect')
    )
    
    username = models.CharField(max_length=50)
    email = CIEmailField(unique=True)
    user_type = models.CharField(max_length=50, choices=USER_TYPE)
    email_verification_status = models.BooleanField(default=False)
    objects = UserManager()
    
    def __str__(self):
        return self.username if self.username else self.email
    
    def save(self, *args, **kwargs):
        if not self.id:
            if not self.username:
                self.username = self.email.split('@')[0]
        super().save(*args, **kwargs)

