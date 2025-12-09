from django.urls import include, path
from django.contrib.auth import views as auth_views
from django.conf import settings
from .views.auth import (
    SignupView,
    complete_profile,
    profile_settings,
    login,
    email_verification,
    forgot_password,
    verify_link,
    update_password,
    forgot_password_verification,
)


urlpatterns = [
    # Signup - primary URL with alias for backward compatibility
    path("signup/", SignupView.as_view(), name="signup"),
    path("get-started/", SignupView.as_view(), name="signup_legacy"),  # Legacy alias
    
    # Authentication
    path("login/", login, name="login"),
    path("logout/", auth_views.LogoutView.as_view(next_page=settings.LOGIN_URL), name="logout"),
    
    # Email verification
    path("email-verify/", email_verification, name="email_verify"),
    path("email/verify/", email_verification, name="email_verify_alt"),  # Alternative RESTful path
    
    # Profile
    path("complete-profile/", complete_profile, name="complete_profile"),
    path("profile/complete/", complete_profile, name="complete_profile_alt"),  # Alternative RESTful path
    path("profile-settings/", profile_settings, name="profile_settings"),
    path("profile/settings/", profile_settings, name="profile_settings_alt"),  # Alternative RESTful path
    
    # Password management - grouped under password/
    path("password/reset/", forgot_password, name="password_reset"),
    path("password/reset/confirm/", update_password, name="password_reset_confirm"),
    path("password/reset/verify/", forgot_password_verification, name="password_reset_verify"),
    
    # Legacy password URLs for backward compatibility
    path("forgot-password/", forgot_password, name="forgot_password"),
    path("update-password/", update_password, name="update_password"),
    path("forgot-password-verify/", forgot_password_verification, name="forgot_password_verify"),
    
    # Verification
    path("verify-link/", verify_link, name="verify_link"),
    path("verify/", verify_link, name="verify_link_alt"),  # Alternative RESTful path
    
    # API
    path("api/", include(("user.api.urls", "user"), namespace="api")),
]
