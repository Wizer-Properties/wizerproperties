from allauth.socialaccount.signals import pre_social_login
from django.dispatch import receiver
from django.db.models.signals import post_save
from django.dispatch import receiver
from user.models import User, DeveloperProfile, AgentProfile
from core.models import AdminSettings


@receiver(pre_social_login)
def link_to_existing_user(sender, request, sociallogin, **kwargs):
    user_email = sociallogin.account.extra_data.get('email')
    if user_email:
        try:
            existing_user = User.objects.get(email=user_email)
            sociallogin.connect(request, existing_user)

        except User.DoesNotExist:
            pass


@receiver(post_save, sender=DeveloperProfile)
def set_default_developer_credit(sender, instance, created, **kwargs):
    if created and instance.credit_balance == 0:
        settings = AdminSettings.objects.last()
        if settings:
            instance.credit_balance = settings.initial_credit_balance_for_developer
            instance.save(update_fields=['credit_balance'])


@receiver(post_save, sender=AgentProfile)
def set_default_agent_credit(sender, instance, created, **kwargs):
    if created and instance.credit_balance == 0:
        settings = AdminSettings.objects.last()
        if settings:
            instance.credit_balance = settings.initial_credit_balance_for_agent
            instance.save(update_fields=['credit_balance'])

