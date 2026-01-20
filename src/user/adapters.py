from typing import Any, Optional

from allauth.socialaccount.adapter import DefaultSocialAccountAdapter


class CustomAccountAdapter(DefaultSocialAccountAdapter):
    def pre_social_login(self, request: Any, sociallogin: Any) -> None:
        """Handle any logic before logging in with a social account."""
        pass  # Optional: Add custom behavior if needed.

    def save_user(self, request: Any, sociallogin: Any, form: Any = None) -> Any:
        user = super().save_user(request, sociallogin, form)
        user.email_verification_status = True
        user.auth_type = 'google'
        user.save()
        return user
