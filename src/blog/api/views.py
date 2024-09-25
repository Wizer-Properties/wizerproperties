from rest_framework import generics
from django_filters.rest_framework import DjangoFilterBackend
from django.db.models import Q, Count
from blog.models import Post, Category
from blog.api.serializers import PostListSerializer, RelatedPostSerializer
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


class RelatedPostListView(generics.ListAPIView):
    serializer_class = RelatedPostSerializer
    http_method_names = ['get']

    def get_queryset(self):
        read_post_ids = self.request.query_params.get('read_posts', '').split(',')
        read_post_ids = [int(id) for id in read_post_ids if id.isdigit()]

        read_categories = self.request.query_params.get('categories', '').split(',')
        read_categories = [cat.strip() for cat in read_categories if cat.strip()]

        current_post_id = self.request.query_params.get('current_post_id')
        current_post_id = int(current_post_id) if current_post_id and current_post_id.isdigit() else None

        queryset = Post.objects.filter(status='published').exclude(id__in=read_post_ids)

        try:
            if read_categories:
                queryset = queryset.filter(categories__name__in=read_categories)
            elif current_post_id:
                current_post = Post.objects.filter(id=current_post_id).first()
                if current_post and current_post.categories.exists():
                    queryset = queryset.filter(categories__in=current_post.categories.all())

            # If not enough related posts, add popular and recent posts
            if queryset.count() < 5:
                popular_posts = Post.objects.filter(status='published').exclude(id__in=read_post_ids).order_by('-total_read_count', '-total_likes', '-created_at')
                queryset = queryset | popular_posts

            # Order by popularity (read count) and recency
            queryset = queryset.order_by('-total_read_count', '-total_likes', '-created_at').exclude(id=current_post_id).distinct()
        except Exception as e:
            return Post.objects.none()  # Return an empty queryset instead of a list

        return queryset[:5]  # Limit to 5 posts
