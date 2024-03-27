from django.urls import include, path
from .views import create_property, get_property, update_property, search_property, comparison_property, favorite_list, dev_agent_property_list

urlpatterns = [
    path("create/", create_property, name="create"),
    path("details/<int:id>/", get_property, name="get"),
    path("update/<int:id>/", update_property, name="update"),
    path("search/", search_property, name="search"),
    path("comparison/", comparison_property, name="comparison"),
    path("favorite-list/", favorite_list, name="favorite_list"),
    path("list/", dev_agent_property_list, name="list"),
    path("api/", include(("property.api.urls", "property"), namespace="api")),
]
