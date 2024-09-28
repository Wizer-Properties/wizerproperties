from django.urls import include, path
from .views import blog_list, blog_details

urlpatterns = [
    path("", blog_list, name="blog_list"),
    path("<slug:slug>/", blog_details, name="blog_details"),
    path("api/", include("blog.api.urls")),
]
