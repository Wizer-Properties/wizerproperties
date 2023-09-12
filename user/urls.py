from django.urls import path

from .views.auth import SignupView


urlpatterns = [
    path('get-started/', SignupView.as_view(), name='signup'),
]
