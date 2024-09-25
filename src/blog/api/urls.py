from django.urls import path
from .views import PostListView, RelatedPostListView

urlpatterns = [
    path('posts/', PostListView.as_view(), name='post-list'),
    path('posts/related/', RelatedPostListView.as_view(), name='related-post-list'),
]
