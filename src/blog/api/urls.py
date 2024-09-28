from django.urls import path
from .views import PostListView, RelatedPostListView, PostLikeDislikeView

urlpatterns = [
    path('posts/', PostListView.as_view(), name='post-list'),
    path('posts/related-posts/', RelatedPostListView.as_view(), name='related-post-list'),
    path('posts/post-like-dislike/', PostLikeDislikeView.as_view(), name='post-like-dislike'),
]
