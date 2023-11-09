from rest_framework.routers import DefaultRouter
from django.urls import path, include
from schedule.api.views import VisitingScheduleViewSet

router = DefaultRouter()
router.register(r"", VisitingScheduleViewSet, basename="schedules")

urlpatterns = [
    path("api/", include((router.urls, "schedule"), namespace="schedule")),
]
