from rest_framework import serializers
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
