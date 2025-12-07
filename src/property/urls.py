from django.urls import include, path
from .views import (
    discount_property_list,
    featured_property_list,
    create_discount_property,
    create_featured_property,
    edit_discount_property,
    edit_featured_property,
    delete_discount_property,
    delete_featured_property,
    create_property, get_property, 
    update_property, search_property, 
    comparison_property,
    favorite_list, dev_agent_property_list, 
    search_property_with_map
)

urlpatterns = [
    path("create/", create_property, name="create"),
    path("details/<int:id>/", get_property, name="get"),
    path("update/<int:id>/", update_property, name="update"),
    path("search/", search_property, name="search"),
    path("search-with-map/", search_property_with_map, name="search_with_map"),
    path("comparison/", comparison_property, name="comparison"),
    path("favorite-list/", favorite_list, name="favorite_list"),
    path("list/<int:id>/", dev_agent_property_list, name="list"),
    
    # Discount and Featured Property URLs
    path("discount/list/", discount_property_list, name="discount_list"),
    path("featured/list/", featured_property_list, name="featured_list"),
    path("discount/create/", create_discount_property, name="create_discount"),
    path("featured/create/", create_featured_property, name="create_featured"),
    path("discount/edit/<int:discount_id>/", edit_discount_property, name="edit_discount"),
    path("featured/edit/<int:featured_id>/", edit_featured_property, name="edit_featured"),
    path("discount/delete/<int:discount_id>/", delete_discount_property, name="delete_discount"),
    path("featured/delete/<int:featured_id>/", delete_featured_property, name="delete_featured"),
    
    path("api/", include(("property.api.urls", "property"), namespace="api")),
]
