from typing import Any, TYPE_CHECKING
from allauth.socialaccount.signals import pre_social_login
from django.dispatch import receiver
from django.db.models.signals import post_save
from user.models import User, DeveloperProfile, AgentProfile
from core.models import AdminSettings

if TYPE_CHECKING:
    from django.http import HttpRequest
    from allauth.socialaccount.models import SocialLogin


@receiver(pre_social_login)
def link_to_existing_user(sender: Any, request: "HttpRequest", sociallogin: "SocialLogin", **kwargs: Any) -> None:
    user_email = sociallogin.account.extra_data.get('email')
    if user_email:
        try:
            existing_user = User.objects.get(email=user_email)
            sociallogin.connect(request, existing_user)

        except User.DoesNotExist:
            pass


@receiver(post_save, sender=DeveloperProfile)
def set_default_developer_credit(sender: Any, instance: DeveloperProfile, created: bool, **kwargs: Any) -> None:
    if created and instance.credit_balance == 0:
        settings = AdminSettings.objects.last()
        if settings:
            instance.credit_balance = settings.initial_credit_balance_for_developer
            instance.save(update_fields=['credit_balance'])


@receiver(post_save, sender=AgentProfile)
def set_default_agent_credit(sender: Any, instance: AgentProfile, created: bool, **kwargs: Any) -> None:
    if created and instance.credit_balance == 0:
        settings = AdminSettings.objects.last()
        if settings:
            instance.credit_balance = settings.initial_credit_balance_for_agent
            instance.save(update_fields=['credit_balance'])

