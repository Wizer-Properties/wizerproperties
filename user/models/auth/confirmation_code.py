import secrets
from django.db import models
from django.conf import settings
from django.utils import timezone
from django.urls import reverse
from urllib.parse import urlencode
from user.models.auth import User
from core.models import TimestampedModel
from utils.general_func import send_email


class ConfirmationCodeManager(models.Manager):
    def get_queryset(self):
        return super().get_queryset().filter(is_used=False, expiration_date__gte=timezone.now())

    def send_confirmation_code(self, request, user, confirmation_type):
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
            link = request.scheme+'://'+ request.get_host() + \
                reverse('user:verify_link')+'?'+ urlencode(params)
        elif confirmation_type == "forgot_password":
            subject = "Forgot Password"
            template = "email/forgot_password_email.html"
            params.update({"verification_type": "forgot_password"})
            link = request.scheme+'://'+ request.get_host() + \
                reverse('user:verify_link')+'?'+ urlencode(params)

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

    user = models.ForeignKey(User, on_delete=models.CASCADE)
    code = models.CharField(max_length=100, null=True)
    confirmation_type = models.CharField(max_length=50, choices=CONFIRMATION_TYPE, null=True)
    is_used = models.BooleanField(default=False)
    expiration_date = models.DateTimeField(null=True)

    objects = ConfirmationCodeManager()

    def __str__(self):
        return self.code

    def save(self, *args, **kwargs):
        # Set the expiration date when a confirmation code is created or updated
        if not self.expiration_date:
            self.expiration_date = timezone.now() + timezone.timedelta(
                days=settings.CONFIRMATION_CODE_EXPIRATION_DAYS
            )  # Adjust the expiration period as needed
        super().save(*args, **kwargs)

    def verify_confirmation_code(self):
        self.is_used = True
        self.save()
        if self.confirmation_type == "account_verification":
            self.user.email_verification_status = True
            self.user.save()

        return True
