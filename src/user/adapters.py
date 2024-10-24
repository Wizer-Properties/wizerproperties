from allauth.socialaccount.adapter import DefaultSocialAccountAdapter

class CustomAccountAdapter(DefaultSocialAccountAdapter):
    def pre_social_login(self, request, sociallogin):
        """Handle any logic before logging in with a social account."""
        pass  # Optional: Add custom behavior if needed.

    def save_user(self, request, sociallogin, form=None):
        user = super().save_user(request, sociallogin, form)
        user.email_verification_status = True
        user.save()
        return user
