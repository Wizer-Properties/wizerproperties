from django.urls import include, path
from .views import create_property, get_property

urlpatterns = [
    path("create/", create_property, name="create_property"),
    path("details/", get_property, name="get_property"),
]
