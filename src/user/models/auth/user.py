from django.db import models
from django.contrib.auth.models import AbstractUser, BaseUserManager

from core.models import TimestampedModel
from utils.general_data import USER_TYPE


class UserManager(BaseUserManager):
    use_in_migrations = True

    def _create_user(self, email, password, **extra_fields):
        # Create and save a User with the given email and password.

        if not email:
            raise ValueError(_("The given email must be set"))
        email = self.normalize_email(email)

        user = self.model(email=email, **extra_fields)
        user.set_password(password)
        user.save(using=self._db)
        return user

    def create_user(self, email, password=None, **extra_fields):
        extra_fields.setdefault("is_staff", False)
        extra_fields.setdefault("is_superuser", False)
        return self._create_user(email, password, **extra_fields)

    def create_superuser(self, email, password, **extra_fields):
        # Create and save a SuperUser with the given email and password.

        extra_fields.setdefault("is_staff", True)
        extra_fields.setdefault("is_superuser", True)

        if extra_fields.get("is_staff") is not True:
            raise ValueError("Superuser must have is_staff=True.")
        if extra_fields.get("is_superuser") is not True:
            raise ValueError("Superuser must have is_superuser=True.")

        return self._create_user(email, password, **extra_fields)

    def get_by_natural_key(self, email):
        # for user id(email) case insensitive
        case_insensitive_username_field = "{}__iexact".format(self.model.USERNAME_FIELD)
        return self.get(**{case_insensitive_username_field: email})


class User(TimestampedModel, AbstractUser):
    USERNAME_FIELD = "email"
    REQUIRED_FIELDS = []

    username = models.CharField(max_length=50)
    email = models.EmailField(db_collation="case_insensitive", unique=True)
    user_type = models.CharField(max_length=50, choices=USER_TYPE)
    email_verification_status = models.BooleanField(default=False)
    is_complete_profile = models.BooleanField(default=False)  # To track profile completion

    objects = UserManager()

    def __str__(self):
        return self.username if self.username else self.email

    def save(self, *args, **kwargs):
        if not self.id:
            if not self.username:
                self.username = self.email.split("@")[0]
        super().save(*args, **kwargs)
        
    @property
    def full_name(self):
        if self.first_name and self.last_name:
            return f"{self.first_name} {self.last_name}"
        elif self.first_name:
            return self.first_name
        elif self.last_name:
            return self.last_name
        return self.username
