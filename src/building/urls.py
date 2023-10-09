from django.urls import include, path
from .views import create_building

urlpatterns = [
    path("create/", create_building, name="create_building"),

]
