from rest_framework import serializers
from django.db.models import Avg
from .default import PropertySerializer
from .media import PropertyMediaSerializer


class PropertyDetailsSerializer(PropertySerializer):
    building_type = serializers.CharField(source="building.type", read_only=True)
    address = serializers.CharField(source="building.address", read_only=True)
    latitude = serializers.CharField(source="building.latitude", read_only=True)
    longitude = serializers.CharField(source="building.longitude", read_only=True)
    construction_year = serializers.CharField(source="building.construction_year", read_only=True)
    facility_view = serializers.URLField(source="building.facility_view", read_only=True)
    location_view = serializers.URLField(source="building.location_view", read_only=True)
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
            "building_type",
            "address",
            "latitude",
            "longitude",
            "construction_year",
            "facility_view",
            "location_view",
            "is_compared",
            "is_favorited",
            "default_images",
            "reviews",
        ]

    def get_default_images(self, obj):
        request = self.context.get("request")
        images = obj.media_files.filter(type="image")

        # Determine the number of default_images to return in the list based on the provided default_images_number parameter.
        default_images_number = request.GET.get("default_images_number")
        if default_images_number:
            images = images[: int(default_images_number)]

        return PropertyMediaSerializer(images, many=True).data
        
    def get_reviews(self, obj):
        request = self.context.get("request")
        reviews = obj.building.reviews.all()
        total_rating = reviews.count()
        average_rating = reviews.aggregate(Avg('rating'))['rating__avg']
        data = {
            "total_rating": total_rating,
            "average_rating": round(average_rating, 2) if average_rating is not None else 0,
        }
        reviewed_by = request.GET.get("reviewed_by")
        if reviewed_by:
            try:
                has_reviewed = reviews.filter(user__id=reviewed_by).exists()
                data["has_reviewed"] = has_reviewed
            except ValueError:
                # Handle the case where 'reviewed_by' is not a valid integer
                pass

        return data
