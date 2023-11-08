from django.urls import include, path

urlpatterns = [
    path("api/", include(("schedule.api.urls", "schedule"), namespace="api")),
]