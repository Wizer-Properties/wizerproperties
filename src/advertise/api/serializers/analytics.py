from rest_framework import serializers
from advertise.models import Advertisement, AdDemography, AdViewerLocation


class AdDemographySerializer(serializers.ModelSerializer):
    
    class Meta:
        model = AdDemography
        fields = [
            "id",
            "male_visitors",
            "female_visitors",
        ]


class AdViewerLocationSerializer(serializers.ModelSerializer):
    
    class Meta:
        model = AdViewerLocation
        fields = [
            "id",
            "address",
            "view_from_this_location",
        ]

class AdAnalyticsSerializer(serializers.ModelSerializer):
    property_title = serializers.CharField(source="property.title", read_only=True)
    conversion_rate = serializers.SerializerMethodField()
    addemography = AdDemographySerializer(read_only=True)
    adviewerlocation = AdViewerLocationSerializer(source="adviewerlocation_set", many=True, read_only=True)

    class Meta:
        model = Advertisement
        fields = [
            "id",
            "property",
            "property_title",
            "number_of_clicked",
            "view_time",
            "conversion_rate",
            "addemography",
            "adviewerlocation",
        ]
    
    def get_conversion_rate(self, obj):
        return obj.conversion_rate()
