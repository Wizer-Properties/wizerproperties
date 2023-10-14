from django.urls import include, path
from .views import create_building, get_building

urlpatterns = [
    path("create/", create_building, name="create_building"),
    path("details/", get_building, name="get_building"),
    path("api/", include(("building.api.urls", "building"), namespace="api")),
]
