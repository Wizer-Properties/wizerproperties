from django.urls import path

from .views.auth import SignupView, AccountVerificationView


urlpatterns = [
    path('get-started/', SignupView.as_view(), name='signup'),
    path('account-verify/', AccountVerificationView.as_view(), name='account-verify'),
]
