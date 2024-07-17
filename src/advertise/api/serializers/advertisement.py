from rest_framework import serializers
from advertise.models import Advertisement


class AdvertisementSerializer(serializers.ModelSerializer):
    property_title = serializers.CharField(source="property.title", read_only=True)
    conversion_rate = serializers.SerializerMethodField()

    class Meta:
        model = Advertisement
        fields = [
            "id",
            "type",
            "position",
            "property",
            "property_title",
            "run_time",
            "number_of_clicked",
            "view_time",
            "conversion_rate",
        ]
    
    def get_conversion_rate(self, obj):
        return obj.conversion_rate()
