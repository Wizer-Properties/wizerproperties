from typing import Optional, TYPE_CHECKING
from rest_framework import serializers
from building.models import Building

if TYPE_CHECKING:
    _Base = serializers.ModelSerializer[Building]
else:
    _Base = serializers.ModelSerializer


class BuildingInfoForPropertySerializer(_Base):
    default_image = serializers.SerializerMethodField()
    status = serializers.CharField(source="get_status_display", read_only=True)

    class Meta:
        model = Building
        fields = [
            "id",
            "title",
            "description",
            "type",
            "status",
            "total_units_for_sale",
            "address",
            "project_total_area",
            "total_floors",
            "default_image",
        ]

    def get_default_image(self, obj: Building) -> Optional[str]:
        image = obj.media_files.filter(type="image").first()
        return image.file.url if image and image.file else None
