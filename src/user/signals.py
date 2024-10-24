from allauth.socialaccount.signals import pre_social_login
from django.dispatch import receiver
from django.contrib.auth import get_user_model

CustomUser = get_user_model()

@receiver(pre_social_login)
def link_to_existing_user(sender, request, sociallogin, **kwargs):
    user_email = sociallogin.account.extra_data.get('email')
    if user_email:
        try:
            existing_user = CustomUser.objects.get(email=user_email)
            sociallogin.connect(request, existing_user)

        except CustomUser.DoesNotExist:
            pass
