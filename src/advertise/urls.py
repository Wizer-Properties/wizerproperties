from django.urls import include, path
from .views import create_reels, edit_reels, advertise_analytics

urlpatterns = [
    path("create-reels/", create_reels, name="create_reels"),
    path("edit-reels/<int:id>/", edit_reels, name="create_reels"),
    path("analytics/", advertise_analytics, name="analytics"),
    path("api/", include(("advertise.api.urls", "advertise"), namespace="api")),
]
