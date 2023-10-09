from django.urls import include, path
from .views import create_property

urlpatterns = [
    path("create/", create_property, name="create_property"),

]
