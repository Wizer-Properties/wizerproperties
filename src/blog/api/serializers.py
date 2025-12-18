from typing import Any, Dict, List, TYPE_CHECKING
from rest_framework import serializers
from blog.models import Post

if TYPE_CHECKING:
    _Base = serializers.ModelSerializer[Post]
else:
    _Base = serializers.ModelSerializer


class PostListSerializer(_Base):
    creator_info = serializers.SerializerMethodField()
    categories = serializers.SerializerMethodField()
    created_at = serializers.DateTimeField(format='%d %b, %Y')
    
    class Meta:
        model = Post
        fields = [
            'id', 'slug', 'title', 'subtitle', 'creator_info', 'banner_image', 'categories', 
            'total_read_count', 'estimated_read_time', 'total_likes', 'created_at',
        ]

    def get_categories(self, obj: Post) -> List[str]:
        return [str(category.name) for category in obj.categories.all()]

    def get_creator_info(self, obj: Post) -> Dict[str, Any]:
        return {
            "name": obj.creator.full_name,
        }


class RelatedPostSerializer(_Base):
    creator_info = serializers.SerializerMethodField()
    categories = serializers.SerializerMethodField()
    created_at = serializers.DateTimeField(format='%d %b, %Y')
    
    class Meta:
        model = Post
        fields = [
            'id', 'slug',  'title', 'subtitle', 'creator_info', 'banner_image', 'categories', 
            'total_read_count', 'estimated_read_time', 'total_likes', 'created_at',
        ]
        
    def get_categories(self, obj: Post) -> List[str]:
        return [str(category.name) for category in obj.categories.all()]
        
    def get_creator_info(self, obj: Post) -> Dict[str, Any]:
        return {
            "name": obj.creator.full_name,
        }
