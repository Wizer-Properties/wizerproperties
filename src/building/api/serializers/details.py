from rest_framework import serializers
from django.db.models import Avg
from .media import BuildingMediaSerializer
from .default import BuildingSerializer


class BuildingDetailsSerializer(BuildingSerializer):
    default_images = serializers.SerializerMethodField()
    reviews = serializers.SerializerMethodField()
    status = serializers.CharField(source="get_status_display", read_only=True)

    class Meta(BuildingSerializer.Meta):
        fields = BuildingSerializer.Meta.fields + [
            "lowest_price",
            "highest_price",
            "latitude",
            "longitude",
            "status",
            "construction_year",
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

        return BuildingMediaSerializer(images, many=True).data

    def get_reviews(self, obj):
        request = self.context.get("request")
        reviews = obj.reviews.all()
        total_rating = reviews.count()
        average_rating = reviews.aggregate(Avg("rating"))["rating__avg"]
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
