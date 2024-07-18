from rest_framework import serializers
from advertise.models import Advertisement


class AdvertisementSerializer(serializers.ModelSerializer):
    property_title = serializers.CharField(source="property.title", read_only=True)

    class Meta:
        model = Advertisement
        fields = [
            "id",
            "property_title",
            "created_at",
            "end_at",
        ]
