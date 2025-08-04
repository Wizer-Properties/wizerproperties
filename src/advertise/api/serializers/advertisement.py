from rest_framework import serializers
from django.conf import settings
from advertise.models import Advertisement


class AdvertisementSerializer(serializers.ModelSerializer):
    property_title = serializers.CharField(source="property.title", read_only=True)
    end_at = serializers.SerializerMethodField()
    
    class Meta:
        model = Advertisement
        fields = [
            "id",
            "property_title",
            "ad_location",
            "created_at",
            "end_at",
        ]

    def get_end_at(self, obj):
        return obj.end_at()
    
    


class AdvertisementSuggestionSerializer(serializers.ModelSerializer):
    banner_image = serializers.SerializerMethodField()
    property_id = serializers.IntegerField(source="property.id", read_only=True)

    class Meta:
        model = Advertisement
        fields = [
            "id",
            "banner_image",
            "property_id",
        ]
    
    def get_banner_image(self, obj):
        # Returns banner image
        if obj.banner:
            return obj.banner.url

        return None
