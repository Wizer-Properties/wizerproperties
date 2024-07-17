from rest_framework import serializers
from advertise.models import Advertisement, AdDemography, AdViewerLocation


class AdAnalyticsClickSerializer(serializers.ModelSerializer):
    property_title = serializers.CharField(source="property.title", read_only=True)

    class Meta:
        model = Advertisement
        fields = [
            "id",
            "property",
            "property_title",
            "number_of_clicked",
        ]
class AdAnalyticsViewTimeSerializer(serializers.ModelSerializer):
    property_title = serializers.CharField(source="property.title", read_only=True)

    class Meta:
        model = Advertisement
        fields = [
            "id",
            "property",
            "property_title",
            "view_time",
        ]

class AdDemographySerializer(serializers.ModelSerializer):
    
    class Meta:
        model = AdDemography
        fields = [
            "id",
            "male_visitors",
            "female_visitors",
        ]


class AdAnalyticsGenderSerializer(serializers.ModelSerializer):
    property_title = serializers.CharField(source="property.title", read_only=True)
    addemography = AdDemographySerializer(read_only=True)

    class Meta:
        model = Advertisement
        fields = [
            "id",
            "property",
            "property_title",
            "addemography",
        ]

class AdViewerLocationSerializer(serializers.ModelSerializer):
    
    class Meta:
        model = AdViewerLocation
        fields = [
            "id",
            "address",
            "view_from_this_location",
        ]

class AdAnalyticsLocationSerializer(serializers.ModelSerializer):
    property_title = serializers.CharField(source="property.title", read_only=True)
    adviewerlocation = AdViewerLocationSerializer(source="adviewerlocation_set", many=True, read_only=True)

    class Meta:
        model = Advertisement
        fields = [
            "id",
            "property",
            "property_title",
            "adviewerlocation",
        ]
