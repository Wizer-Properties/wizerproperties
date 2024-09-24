from django.urls import include, path
from .views import blog_list, blog_details

urlpatterns = [
    path("", blog_list, name="blog_list"),
    path("<str:title>/", blog_details, name="blog_details"),
]
