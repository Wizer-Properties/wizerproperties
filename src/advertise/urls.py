from django.urls import include, path
from .views import create_reels

urlpatterns = [
    path("create-reels/", create_reels, name="create_reels"),
    path("api/", include(("advertise.api.urls", "advertise"), namespace="api")),
]
