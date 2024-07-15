from django.urls import include, path
from rest_framework import routers

from advertise.api.views import ReelViewSet, AdvertisementViewSet

router = routers.DefaultRouter()
router.register(r"reel", ReelViewSet, basename="reel")
router.register(r"advertisement", AdvertisementViewSet, basename="advertisement")

urlpatterns = [
    path("", include((router.urls, "advertise"), namespace="advertise")),
]
