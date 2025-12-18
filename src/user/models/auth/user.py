from django.db import models
from django.contrib.auth.models import AbstractUser, BaseUserManager
from django.utils.translation import gettext_lazy as _
from typing import Any, Optional, TypeVar

from core.models import TimestampedModel
from utils.general_data import USER_TYPE

__all__ = ["User", "UserManager"]

_T = TypeVar("_T", bound="User")

class UserManager(BaseUserManager["User"]):
    use_in_migrations = True

    def _create_user(self, email: str, password: Optional[str], **extra_fields: Any) -> "User":
        # Create and save a User with the given email and password.

        if not email:
            raise ValueError(_("The given email must be set"))
        email = self.normalize_email(email)

        user = self.model(email=email, **extra_fields)
        user.set_password(password)
        user.save(using=self._db)
        return user

    def create_user(self, email: str, password: Optional[str] = None, **extra_fields: Any) -> "User":
        extra_fields.setdefault("is_staff", False)
        extra_fields.setdefault("is_superuser", False)
        return self._create_user(email, password, **extra_fields)

    def create_superuser(self, email: str, password: Optional[str] = None, **extra_fields: Any) -> "User":
        # Create and save a SuperUser with the given email and password.

        extra_fields.setdefault("is_staff", True)
        extra_fields.setdefault("is_superuser", True)

        if extra_fields.get("is_staff") is not True:
            raise ValueError("Superuser must have is_staff=True.")
        if extra_fields.get("is_superuser") is not True:
            raise ValueError("Superuser must have is_superuser=True.")

        return self._create_user(email, password, **extra_fields)

    def get_by_natural_key(self, username: Optional[str]) -> "User":
        if username is None:
            raise ValueError("Username/Email is required")
        # for user id(email) case insensitive
        case_insensitive_username_field = "{}__iexact".format(self.model.USERNAME_FIELD)
        return self.get(**{case_insensitive_username_field: username})


class User(TimestampedModel, AbstractUser):
    USERNAME_FIELD = "email"
    REQUIRED_FIELDS = []
    AUTH_TYPE = (
        ('email', 'Email'),
        ('google', 'Google'),
    )

    username = models.CharField(max_length=50)
    email = models.EmailField(db_collation="case_insensitive", unique=True)
    user_type = models.CharField(max_length=50, choices=USER_TYPE, blank=True)
    email_verification_status = models.BooleanField(default=False)
    is_complete_profile = models.BooleanField(default=False)  # To track profile completion
    auth_type = models.CharField(max_length=50, choices=AUTH_TYPE, default='email')

    objects: UserManager = UserManager()  # type: ignore[misc, assignment]

    def __str__(self) -> str:
        return self.username if self.username else self.email

    def save(self, *args: Any, **kwargs: Any) -> None:
        if not self.id:
            if not self.username:
                self.username = self.email.split("@")[0]
        super().save(*args, **kwargs)
        
    @property
    def full_name(self) -> str:
        if self.first_name and self.last_name:
            return f"{self.first_name} {self.last_name}"
        elif self.first_name:
            return self.first_name
        elif self.last_name:
            return self.last_name
        return str(self.username)
