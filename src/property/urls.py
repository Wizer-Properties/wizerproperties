from django.urls import include, path
from .views import create_property, update_property

urlpatterns = [
    path("create/", create_property, name="create"),
    path("update/<int:id>/", update_property, name="update"),
    path("api/", include(("property.api.urls", "property"), namespace="api")),
]
