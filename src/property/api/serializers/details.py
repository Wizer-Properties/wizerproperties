from rest_framework import serializers
from django.db.models import Avg
from typing import Any, Dict, List, Optional
from property.models import Property
from .default import PropertySerializer
from .media import PropertyMediaSerializer


class PropertyDetailsSerializer(PropertySerializer):
    building_title = serializers.CharField(source="building.title", read_only=True)
    building_type = serializers.CharField(source="building.type", read_only=True)
    building_sub_type = serializers.CharField(source="building.get_sub_type_display", read_only=True)
    building_status = serializers.CharField(source="building.get_status_display", read_only=True)
    address = serializers.CharField(source="building.address", read_only=True)
    latitude = serializers.CharField(source="building.latitude", read_only=True)
    longitude = serializers.CharField(source="building.longitude", read_only=True)
    construction_year = serializers.CharField(source="building.construction_year", read_only=True)
    facility_view = serializers.URLField(source="building.facility_view", read_only=True)
    location_view = serializers.URLField(source="building.location_view", read_only=True)
    have_freehold = serializers.BooleanField(source="building.have_freehold", read_only=True)
    have_leasehold = serializers.BooleanField(source="building.have_leasehold", read_only=True)
    developer_email = serializers.CharField(source="created_by.email", read_only=True)
    developer_image = serializers.SerializerMethodField()
    developer_phone_number = serializers.SerializerMethodField()
    developer_company_name = serializers.SerializerMethodField()
    is_compared = serializers.BooleanField(read_only=True)
    is_favorited = serializers.BooleanField(read_only=True)
    default_images = serializers.SerializerMethodField()
    reviews = serializers.SerializerMethodField()

    class Meta(PropertySerializer.Meta):
        fields = PropertySerializer.Meta.fields + [
            "unit_id",
            "interior_view",
            "number_of_balcony",
            "number_of_car_parking",
            "balcony_direction",
            "main_door_direction",
            "unit_position",
            "tenant_occupied_validity",
            "is_active",
            "building_id",
            "building_title",
            "building_type",
            "building_sub_type",
            "building_status",
            "address",
            "latitude",
            "longitude",
            "construction_year",
            "facility_view",
            "location_view",
            "have_freehold",
            "have_leasehold",
            "developer_email",
            "developer_image",
            "developer_phone_number",
            "developer_company_name",
            "is_compared",
            "is_favorited",
            "default_images",
            "reviews",
        ]

    def get_developer_image(self, obj: Property) -> str:
        user = obj.created_by
        if not user:
            return ""
        if hasattr(user, "developerprofile"):
            logo = user.developerprofile.company_logo
            return str(logo.url) if logo else ""
        elif hasattr(user, "agentprofile"):
            logo = user.agentprofile.company_logo
            return str(logo.url) if logo else ""
        return ""

    def get_developer_phone_number(self, obj: Property) -> str:
        user = obj.created_by
        if not user:
            return ""
        if hasattr(user, "developerprofile"):
            return str(user.developerprofile.phone_number) if user.developerprofile.phone_number else ""
        elif hasattr(user, "agentprofile"):
            return str(user.agentprofile.phone_number) if user.agentprofile.phone_number else ""
        return ""

    def get_developer_company_name(self, obj: Property) -> str:
        user = obj.created_by
        if not user:
            return ""
        if hasattr(user, "developerprofile"):
            return str(user.developerprofile.company_name) if user.developerprofile.company_name else ""
        elif hasattr(user, "agentprofile"):
            return str(user.agentprofile.company_name) if user.agentprofile.company_name else ""
        return ""

    def get_default_images(self, obj: Property) -> Any:
        request = self.context.get("request")
        images = obj.media_files.filter(type="image")

        # Determine the number of default_images to return in the list based on the provided default_images_number parameter.
        if request:
            default_images_number = request.GET.get("default_images_number")
            if default_images_number:
                images = images[: int(default_images_number)]

        return PropertyMediaSerializer(images, many=True).data

    def get_reviews(self, obj: Property) -> Dict[str, Any]:
        request = self.context.get("request")
        reviews = obj.building.reviews.all() if obj.building else obj.building.reviews.none() # type: ignore
        total_rating = reviews.count()
        average_rating = reviews.aggregate(Avg("rating"))["rating__avg"]
        data: Dict[str, Any] = {
            "total_rating": total_rating,
            "average_rating": round(average_rating, 2) if average_rating is not None else 0,
        }
        if request:
            reviewed_by = request.GET.get("reviewed_by")
            if reviewed_by:
                try:
                    has_reviewed = reviews.filter(user__id=reviewed_by).exists()
                    data["has_reviewed"] = has_reviewed
                except ValueError:
                    # Handle the case where 'reviewed_by' is not a valid integer
                    pass

        return data
