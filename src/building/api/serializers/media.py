from urllib.parse import urlsplit
from typing import Any, Dict, TYPE_CHECKING
from rest_framework import serializers
from building.models import BuildingMedia

if TYPE_CHECKING:
    _Base = serializers.ModelSerializer[BuildingMedia]
else:
    _Base = serializers.ModelSerializer


class BuildingMediaSerializer(_Base):
    class Meta:
        model = BuildingMedia
        fields = ["id", "file", "type"]

    def to_representation(self, instance: BuildingMedia) -> Dict[str, Any]:
        representation = super().to_representation(instance)

        # Use urlsplit to get the path component
        file_path = representation.get("file", "")
        url_parts = urlsplit(file_path)
        modified_file_path = url_parts.path

        representation["file"] = modified_file_path

        return representation
