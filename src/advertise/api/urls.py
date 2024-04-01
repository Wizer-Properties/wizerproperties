from django.urls import include, path
from rest_framework import routers

from advertise.api.views import ReelViewSet

router = routers.DefaultRouter()
router.register(r"reel", ReelViewSet, basename="reel")

urlpatterns = [
    path("", include((router.urls, "advertise"), namespace="advertise")),
]
