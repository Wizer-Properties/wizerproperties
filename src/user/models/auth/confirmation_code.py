import secrets
from datetime import timedelta
from django.db import models
from django.conf import settings
from django.utils import timezone
from django.urls import reverse
from django.http import HttpRequest
from urllib.parse import urlencode
from typing import TYPE_CHECKING, Any, Dict, Optional, TypeVar

from core.models import TimestampedModel
from utils.general_func import send_email

if TYPE_CHECKING:
    from user.models.auth import User

_T = TypeVar("_T", bound="ConfirmationCode")

class ConfirmationCodeManager(models.Manager["ConfirmationCode"]):
    def get_queryset(self) -> models.QuerySet["ConfirmationCode"]:
        return super().get_queryset().filter(is_used=False, expiration_date__gte=timezone.now())

    def send_confirmation_code(self, request: HttpRequest, user: "User", confirmation_type: str) -> bool:
        code = secrets.token_hex(3)
        model_instance = self.model(
            user=user,
            code=code,
            confirmation_type=confirmation_type
        )
        model_instance.save()

        params = {
            'token': str(code),
        }

        if confirmation_type == "account_verification":
            subject = "Verify Your Account"
            template = "email/account_verification.html"
            params.update({"verification_type": "account_verification"})
            link = f"{request.scheme}://{request.get_host()}{reverse('user:verify_link')}?{urlencode(params)}"
        elif confirmation_type == "forgot_password":
            subject = "Forgot Password"
            template = "email/forgot_password_email.html"
            params.update({"verification_type": "forgot_password"})
            link = f"{request.scheme}://{request.get_host()}{reverse('user:verify_link')}?{urlencode(params)}"
        else:
            return False

        send_email(
            subject=subject,
            to_email=user.email,
            html_content=template,
            context={"site_host": settings.SITE_HOST, "token": code, "link": link},
        )

        return True


class ConfirmationCode(TimestampedModel):
    CONFIRMATION_TYPE = (
        ("account_verification", "Account verification"),
        ("forgot_password", "Forgot password"),
    )

    user = models.ForeignKey(settings.AUTH_USER_MODEL, on_delete=models.CASCADE)
    code = models.CharField(max_length=100, null=True)
    confirmation_type = models.CharField(max_length=50, choices=CONFIRMATION_TYPE, null=True)
    is_used = models.BooleanField(default=False)
    expiration_date = models.DateTimeField(null=True)

    objects = ConfirmationCodeManager()

    def __str__(self) -> str:
        return str(self.code)

    def save(self, *args: Any, **kwargs: Any) -> None:
        # Set the expiration date when a confirmation code is created or updated
        if not self.expiration_date:
            self.expiration_date = timezone.now() + timedelta(
                minutes=settings.CONFIRMATION_CODE_EXPIRATION_TIME
            )  # Adjust the expiration period as needed
        super().save(*args, **kwargs)

    def verify_confirmation_code(self) -> bool:
        self.is_used = True
        self.save()
        if self.confirmation_type == "account_verification":
            self.user.email_verification_status = True
            self.user.save()

        return True
