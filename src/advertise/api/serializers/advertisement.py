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
            "created_at",
            "end_at",
        ]

    def get_end_at(self, obj):
        return obj.end_at()
    
    


class AdvertisementSuggestionSerializer(serializers.ModelSerializer):
    property_image = serializers.SerializerMethodField()
    property_id = serializers.IntegerField(source="property.id", read_only=True)

    class Meta:
        model = Advertisement
        fields = [
            "id",
            "property_image",
            "property_id",
        ]
    
    def get_property_image(self, obj):
        # Returns property image
        image = obj.property.media_files.filter(type="image").first()
        if image:
            return f"{settings.SITE_HOST}{image.file.url}"

        return None
