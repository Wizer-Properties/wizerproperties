from rest_framework import serializers
from .media import BuildingMediaSerializer
from .default import BuildingSerializer


class BuildingDetailsSerializer(BuildingSerializer):
    default_images = serializers.SerializerMethodField()

    class Meta(BuildingSerializer.Meta):
        fields = BuildingSerializer.Meta.fields + [
            "lowest_price",
            "highest_price",
            "latitude",
            "longitude",
            "construction_year",
            "default_images",
        ]

    def get_default_images(self, obj):
        request = self.context.get("request")
        images = obj.media_files.filter(type="image")

        # Determine the number of default_images to return in the list based on the provided default_images_number parameter.
        default_images_number = request.GET.get("default_images_number")
        if default_images_number:
            images = images[: int(default_images_number)]

        return BuildingMediaSerializer(images, many=True).data
