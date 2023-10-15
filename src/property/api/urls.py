from django.urls import path
from .views import PropertyViewSet


urlpatterns = [
    path("list/", PropertyViewSet.as_view({"get": "list"}), name="list"),
    path("details/<int:pk>/", PropertyViewSet.as_view({"get": "retrieve"}), name="details"),
    path("create/", PropertyViewSet.as_view({"post": "create"}), name="create"),
    path(
        "update/<int:pk>/",
        PropertyViewSet.as_view({"put": "update", "patch": "partial_update"}),
        name="update",
    ),
    path(
        "delete/<int:pk>/",
        PropertyViewSet.as_view({"delete": "destroy"}),
        name="delete",
    ),
]
