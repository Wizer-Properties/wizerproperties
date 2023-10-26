from django.urls import path
from .views import PropertyViewSet, ComparePropertyViewSet


urlpatterns = [
    path("list/", PropertyViewSet.as_view({"get": "list"}), name="list"),
    path("details/<int:pk>/", PropertyViewSet.as_view({"get": "retrieve"}), name="details"),
    path("details/<int:pk>/media-files/", PropertyViewSet.as_view({"get": "media_files"}), name="media_files"),
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
    path("compare/list/", ComparePropertyViewSet.as_view({"get": "list"}), name="compare_list"),
    path("compare/create/", ComparePropertyViewSet.as_view({"post": "create"}), name="compare_create"),
    path(
        "compare/delete/<int:pk>/",
        ComparePropertyViewSet.as_view({"delete": "destroy"}),
        name="compare_delete",
    ),
]
