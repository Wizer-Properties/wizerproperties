from rest_framework import serializers
from blog.models import Post



class PostListSerializer(serializers.ModelSerializer):
    creator_info = serializers.SerializerMethodField()
    categories = serializers.SerializerMethodField()
    created_at = serializers.DateTimeField(format='%d %b, %Y')
    
    class Meta:
        model = Post
        fields = [
            'id', 'slug', 'title', 'subtitle', 'creator_info', 'banner_image', 'categories', 
            'total_read_count', 'estimated_read_time', 'total_likes', 'created_at',
        ]

    def get_categories(self, obj):
        return [category.name for category in obj.categories.all()]

    def get_creator_info(self, obj):
        return {
            "name": obj.creator.full_name,
        }


class RelatedPostSerializer(serializers.ModelSerializer):
    creator_info = serializers.SerializerMethodField()
    categories = serializers.SerializerMethodField()
    created_at = serializers.DateTimeField(format='%d %b, %Y')
    
    class Meta:
        model = Post
        fields = [
            'id', 'slug',  'title', 'subtitle', 'creator_info', 'banner_image', 'categories', 
            'total_read_count', 'estimated_read_time', 'total_likes', 'created_at',
        ]
        
    def get_categories(self, obj):
        return [category.name for category in obj.categories.all()]
        
    def get_creator_info(self, obj):
        return {
            "name": obj.creator.full_name,
        }
