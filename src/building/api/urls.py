from django.urls import path
from .views import BuildingViewSet


urlpatterns = [
    path("list/", BuildingViewSet.as_view({"get": "list"}), name="list"),
    path("details/<int:pk>/", BuildingViewSet.as_view({"get": "retrieve"}), name="details"),
    path("details/<int:pk>/media-files/", BuildingViewSet.as_view({"get": "media_files"}), name="media_files"),
    path(
        "details/<int:pk>/available-units/", BuildingViewSet.as_view({"get": "available_units"}), name="available_units"
    ),
    path("create/", BuildingViewSet.as_view({"post": "create"}), name="create"),
    path(
        "update/<int:pk>/",
        BuildingViewSet.as_view({"put": "update", "patch": "partial_update"}),
        name="update",
    ),
    path(
        "delete/<int:pk>/",
        BuildingViewSet.as_view({"delete": "destroy"}),
        name="delete",
    ),
]
