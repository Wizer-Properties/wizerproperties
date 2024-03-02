from django.urls import path
from .views import PropertyViewSet, ComparePropertyViewSet, ProspectFavoritePropertyViewSet


urlpatterns = [
    path("list/", PropertyViewSet.as_view({"get": "list"}), name="list"),
    path("list/newly-created/", PropertyViewSet.as_view({"get": "newly_created"}), name="newly_created"),
    path("list/popular/", PropertyViewSet.as_view({"get": "popular"}), name="popular"),
    path("list/discount/", PropertyViewSet.as_view({"get": "discount"}), name="discount"),
    path("generate-description/", PropertyViewSet.as_view({"post": "generate_description"}), name="generate_description"),
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
        "compare/delete/",
        ComparePropertyViewSet.as_view({"delete": "perform_destroy"}),
        name="compare_delete",
    ),
    # Prospect Favorite Property Apis
    path(
        "prospect-favorite/list/",
        ProspectFavoritePropertyViewSet.as_view({"get": "list"}),
        name="prospect_favorite_property_list",
    ),
    path(
        "prospect-favorite/add/",
        ProspectFavoritePropertyViewSet.as_view({"post": "create"}),
        name="add_prospect_favorite_property",
    ),
    path(
        "prospect-favorite/remove/",
        ProspectFavoritePropertyViewSet.as_view({"delete": "perform_destroy"}),
        name="remove_prospect_favorite_property",
    ),
]
