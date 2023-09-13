from django.urls import include, path
from .views.auth import SignupView, AccountVerificationView, login


urlpatterns = [
    path("get-started/", SignupView.as_view(), name="signup"),
    path("account-verify/", AccountVerificationView.as_view(), name="account-verify"),
    path("login/", login, name="login"),
]
