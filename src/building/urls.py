from django.urls import include, path
from .views import create_building, update_building

urlpatterns = [
    path("create/", create_building, name="create"),
    path("update/<int:id>/", update_building, name="update"),
    path("api/", include(("building.api.urls", "building"), namespace="api")),
]
