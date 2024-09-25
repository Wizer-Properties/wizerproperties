from rest_framework import generics
from django_filters.rest_framework import DjangoFilterBackend

from blog.models import Post
from blog.api.serializers import PostListSerializer
from blog.api.paginations import CustomPagination
from blog.api.filters import PostFilter


class PostListView(generics.ListAPIView):
    queryset = Post.objects.filter(status='published')
    serializer_class = PostListSerializer
    pagination_class = CustomPagination
    filter_backends = [DjangoFilterBackend]
    filterset_class = PostFilter
    ordering_fields = ['total_read_count', 'total_likes', 'created_at']
    ordering = ['-created_at']  # Default ordering
    http_method_names = ['get']
    
    def get_queryset(self):
        return self.queryset
