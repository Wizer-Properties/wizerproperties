from django.urls import path
from .views import BuildingViewSet, BuildingReviewViewSet


urlpatterns = [
    path("list/", BuildingViewSet.as_view({"get": "list"}), name="list"),
    path("details/<int:pk>/", BuildingViewSet.as_view({"get": "retrieve"}), name="details"),
    path("details/<int:pk>/media-files/", BuildingViewSet.as_view({"get": "media_files"}), name="media_files"),
    path("details/<int:pk>/developer-info/", BuildingViewSet.as_view({"get": "developer_info"}), name="developer_info"),
    path(
        "details/<int:pk>/available-facilities/",
        BuildingViewSet.as_view({"get": "available_facilities"}),
        name="available_facilities",
    ),
    path(
        "details/<int:pk>/available-units/", BuildingViewSet.as_view({"get": "available_units"}), name="available_units"
    ),
    path("details/<int:pk>/schedule/", BuildingViewSet.as_view({"get": "schedule"}), name="schedule"),
    path("create/", BuildingViewSet.as_view({"post": "create"}), name="create"),
    path(
        "generate-description/", BuildingViewSet.as_view({"post": "generate_description"}), name="generate_description"
    ),
    path(
        "re-generate-description/", BuildingViewSet.as_view({"post": "re_generate_description"}), name="re_generate_description"
    ),
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
    # Review
    path("review/list/", BuildingReviewViewSet.as_view({"get": "list"}), name="review_list"),
    path("review/create/", BuildingReviewViewSet.as_view({"post": "create"}), name="review_create"),
    path("building_list_for_map_search/", BuildingViewSet.as_view({"get": "building_list_for_map_search"}), name="building_list_for_map_search"),
]
