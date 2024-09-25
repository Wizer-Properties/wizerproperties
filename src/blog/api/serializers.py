from rest_framework import serializers
from blog.models import Post



class PostListSerializer(serializers.ModelSerializer):
    creator_info = serializers.SerializerMethodField()
    categories = serializers.SerializerMethodField()
    created_at = serializers.DateTimeField(format='%d %b, %Y %H:%M %p')
    class Meta:
        model = Post
        fields = ['id', 'title', 'subtitle', 'creator_info', 'banner_image', 'categories', 'total_read_count', 'total_likes', 'created_at']

    def get_categories(self, obj):
        return [category.name for category in obj.categories.all()]

    def get_creator_info(self, obj):
        return {
            "name": obj.creator.get_full_name(),
        }


class RelatedPostSerializer(serializers.ModelSerializer):
    creator_info = serializers.SerializerMethodField()
    category_name = serializers.CharField(source='category.name', read_only=True)
    created_at = serializers.DateTimeField(format='%d %b, %Y %H:%M %p')
    
    class Meta:
        model = Post
        fields = [
            'id', 'title', 'creator_info', 
            'banner_image', 'category_name', 'created_at'
        ]
        
    def get_creator_info(self, obj):
        return {
            "name": obj.creator.get_full_name(),
        }
