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
    path("get-started/", SignupView.as_view(), name="signup"),
    path("email-verify/", email_verification, name="email_verify"),
    path("login/", login, name="login"),
    path("logout/", auth_views.LogoutView.as_view(next_page=settings.LOGIN_URL), name="logout"),
    path("complete-profile/", complete_profile, name="complete_profile"),
    path("profile-settings/", profile_settings, name="profile_settings"),
    path("forgot-password/", forgot_password, name="forgot_password"),
    path("update-password/", update_password, name="update_password"),
    path("forgot-password-verify/", forgot_password_verification, name="forgot_password_verify"),
    path("verify-link/", verify_link, name="verify_link"),
    path("api/", include(("user.api.urls", "user"), namespace="api")),
]
