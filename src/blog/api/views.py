from datetime import timedelta
from typing import Any, List, Optional, TYPE_CHECKING
from rest_framework import generics
from django_filters.rest_framework import DjangoFilterBackend
from rest_framework.response import Response
from blog.models import Post
from blog.api.serializers import PostListSerializer, RelatedPostSerializer
from blog.api.paginations import CustomPagination
from blog.models import PostInteraction
from django.db.models import Q
from rest_framework.views import APIView
from rest_framework import status
from advertise.models import Advertisement
from advertise.api.serializers import AdvertisementSuggestionSerializer

if TYPE_CHECKING:
    from django.db.models import QuerySet
    _PostListBase = generics.ListAPIView[Post]
    _RelatedPostListBase = generics.ListAPIView[Post]
    _BlogAdBase = generics.ListAPIView[Advertisement]
else:
    _PostListBase = generics.ListAPIView
    _RelatedPostListBase = generics.ListAPIView
    _BlogAdBase = generics.ListAPIView

class PostListView(_PostListBase):
    queryset = Post.objects.filter(status='published')
    serializer_class = PostListSerializer
    pagination_class = CustomPagination
    filter_backends = [DjangoFilterBackend]
    ordering_fields = ['total_read_count', 'total_likes', 'created_at']
    ordering = ['-created_at']  # Default ordering
    # http_method_names = ['get', 'de']
    
    def get_queryset(self) -> "QuerySet[Post]":
        queryset = self.queryset
        
        # Filter by category
        category = self.request.query_params.get('category')
        if category:
            queryset = queryset.filter(categories__name=category)
        
        # Filter by most read
        most_read = self.request.query_params.get('most_read')
        if most_read == 'true':
            queryset = queryset.order_by('-total_read_count')
        
        # Filter by most liked
        most_liked = self.request.query_params.get('most_liked')
        if most_liked == 'true':
            queryset = queryset.order_by('-total_likes')
        
        # Filter by most recent
        most_recent = self.request.query_params.get('most_recent')
        if most_recent == 'true':
            queryset = queryset.order_by('-created_at')
        
        return queryset


class RelatedPostListView(_RelatedPostListBase):
    serializer_class = RelatedPostSerializer
    pagination_class = None
    

    def get_queryset(self) -> "QuerySet[Post]":
        read_posts_id_raw: List[str] = self.request.GET.getlist('read_posts_id')
        read_posts_id: List[int] = [int(id_str) for id_str in read_posts_id_raw if id_str.isdigit()]

        read_categories = self.request.GET.getlist('post_categories_name')
        read_categories = [cat.strip() for cat in read_categories if cat.strip()]

        current_post_id_raw: Optional[str] = self.request.GET.get('current_post_id')
        current_post_id: Optional[int] = int(current_post_id_raw) if current_post_id_raw and current_post_id_raw.isdigit() else None

        queryset = Post.objects.filter(status='published').exclude(id__in=read_posts_id)
                        

        try:
            if read_categories:
                queryset = queryset.filter(categories__name__in=read_categories)
            elif current_post_id:
                current_post = Post.objects.filter(id=current_post_id).first()
                if current_post and current_post.categories.exists():
                    queryset = queryset.filter(categories__in=current_post.categories.all())

            # Order by popularity (read count) and recency
            query_filter = Q(id=current_post_id) if current_post_id else Q()
            queryset = queryset.order_by('-total_read_count', '-total_likes', '-created_at').exclude(query_filter).distinct()
            
            # If not enough related posts, add popular and recent posts
            if queryset.count() < 5:
                popular_posts = Post.objects.filter(Q(status='published')).exclude(
                    Q(id__in=read_posts_id) | Q(id=current_post_id)
                ).order_by('-total_read_count', '-total_likes', '-created_at').distinct()
                queryset = queryset | popular_posts
                
        except Exception:
            return Post.objects.none()  # Return an empty queryset instead of a list

        return queryset[:5]  # Limit to 5 posts


class PostLikeDislikeView(APIView):

    def post(self, request: Any, *args: Any, **kwargs: Any) -> Response:
        post_id = request.data.get('post_id')
        interaction_type = request.data.get('interaction_type')  # either 'like' or 'dislike'
        ip_address = request.META.get('REMOTE_ADDR')
                
        try:
            post = Post.objects.get(id=post_id)
        except Post.DoesNotExist:
            return Response({'error': 'Post not found'}, status=status.HTTP_404_NOT_FOUND)

        # Remove any existing interaction from the user or IP address
        if request.user.is_authenticated:
            PostInteraction.objects.filter(post=post, user=request.user).delete()
        else:
            PostInteraction.objects.filter(post=post, ip_address=ip_address).delete()

        # Create new interaction
        if interaction_type in ['like', 'dislike']:
            if request.user.is_authenticated:
                PostInteraction.objects.create(post=post, user=request.user, interaction_type=interaction_type)
            else:
                PostInteraction.objects.create(post=post, ip_address=ip_address, interaction_type=interaction_type)

        # Update the total like/dislike counts
        post.total_likes = post.interactions.filter(interaction_type='like').count()
        post.total_dislikes = post.interactions.filter(interaction_type='dislike').count()
        post.save()

        return Response({'status': 'success'}, status=status.HTTP_200_OK)



class SaveReadTimeView(APIView):

    def post(self, request: Any, *args: Any, **kwargs: Any) -> Response:
        time_spent = request.data.get('time_spent')
        post_id = request.data.get('post_id')

        try:
            post = Post.objects.get(id=post_id)
            
            # Update the total read time
            # Convert time_spent from seconds to duration
            time_spent_duration = timedelta(seconds=int(time_spent))
            
            # Add the new time_spent to the existing total_read_time
            if post.total_read_time:
                post.total_read_time += time_spent_duration
            else:
                post.total_read_time = time_spent_duration
                
            post.save()            
            return Response({'status': 'success'}, status=status.HTTP_200_OK)
        except Post.DoesNotExist:
            return Response({'error': 'Post not found'}, status=status.HTTP_404_NOT_FOUND)


class BlogAdvertisementView(_BlogAdBase):
    queryset = Advertisement.objects.all()
    serializer_class = AdvertisementSuggestionSerializer
    pagination_class = None
    
    def get_queryset(self) -> "QuerySet[Advertisement]":
        queryset = self.queryset.filter(ad_location='blog')
        return queryset
