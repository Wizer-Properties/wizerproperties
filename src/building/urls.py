from django.urls import include, path
from .views import create_building, get_building, update_building

urlpatterns = [
    path("create/", create_building, name="create"),
    path("details/<int:id>/", get_building, name="get"),
    path("update/<int:id>/", update_building, name="update"),
    path("api/", include(("building.api.urls", "building"), namespace="api")),
]
