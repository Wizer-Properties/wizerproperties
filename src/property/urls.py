from django.urls import include, path
from .views import create_property, get_property, update_property, search_property, comparison_property, create_schedule

urlpatterns = [
    path("create/", create_property, name="create"),
    path("details/<int:id>/", get_property, name="get"),
    path("update/<int:id>/", update_property, name="update"),
    path("search/", search_property, name="search"),
    path("comparison/", comparison_property, name="comparison"),
    path("create_schedule/", create_schedule, name="create_schedule"),
    path("api/", include(("property.api.urls", "property"), namespace="api")),
]
