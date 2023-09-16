from django.urls import include, path
from .views.auth import SignupView, AccountVerificationView, login, logout, profile, email_verification


urlpatterns = [
    path("get-started/", SignupView.as_view(), name="signup"),
    path("account-verify/", AccountVerificationView.as_view(), name="account_verify"),
    path("email-verify/", email_verification, name="email_verify"),
    path("login/", login, name="login"),
    path("logout/", logout, name="logout"),
    path("profile/", profile, name="profile"),
    path("api/", include(("user.api.urls", "user"), namespace="api")),
]
