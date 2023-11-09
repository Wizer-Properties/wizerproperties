from django.urls import include, path
from .views import create_schedule

urlpatterns = [
    path("create_schedule/", create_schedule, name="create_schedule"),
    path("api/", include(("schedule.api.urls", "schedule"), namespace="api")),
]