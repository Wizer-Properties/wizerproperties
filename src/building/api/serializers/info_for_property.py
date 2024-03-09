from rest_framework import serializers
from building.models import Building


class BuildingInfoForPropertySerializer(serializers.ModelSerializer):
    default_image = serializers.SerializerMethodField()

    class Meta:
        model = Building
        fields = [
            "id",
            "title",
            "description",
            "type",
            "total_units_for_sale",
            "address",
            "project_total_area",
            "total_floors",
            "default_image",
        ]

    def get_default_image(self, obj):
        image = obj.media_files.filter(type="image").first()
        return image.file.url
