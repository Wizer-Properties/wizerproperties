from rest_framework import serializers
from advertise.models import Advertisement, AdDemography, AdViewerLocation
from typing import Any, TYPE_CHECKING

if TYPE_CHECKING:
    _DemographyBase = serializers.ModelSerializer[AdDemography]
    _LocationBase = serializers.ModelSerializer[AdViewerLocation]
    _AnalyticsBase = serializers.ModelSerializer[Advertisement]
else:
    _DemographyBase = serializers.ModelSerializer
    _LocationBase = serializers.ModelSerializer
    _AnalyticsBase = serializers.ModelSerializer


class AdDemographySerializer(_DemographyBase):
    
    class Meta:
        model = AdDemography
        fields = [
            "id",
            "male_visitors",
            "female_visitors",
        ]


class AdViewerLocationSerializer(_LocationBase):
    
    class Meta:
        model = AdViewerLocation
        fields = [
            "id",
            "address",
            "view_from_this_location",
        ]

class AdAnalyticsSerializer(_AnalyticsBase):
    property_title = serializers.CharField(source="property.title", read_only=True)
    conversion_rate = serializers.SerializerMethodField()
    formatted_view_time = serializers.SerializerMethodField()
    addemography = AdDemographySerializer(read_only=True)
    adviewerlocation = AdViewerLocationSerializer(source="adviewerlocation_set", many=True, read_only=True)

    class Meta:
        model = Advertisement
        fields = [
            "id",
            "property",
            "property_title",
            "number_of_clicked",
            "formatted_view_time",
            "conversion_rate",
            "addemography",
            "adviewerlocation",
        ]
    
    def get_conversion_rate(self, obj: Advertisement) -> float:
        return obj.conversion_rate()
    
    def get_formatted_view_time(self, obj: Advertisement) -> str:
        return obj.view_time_without_milliseconds()
