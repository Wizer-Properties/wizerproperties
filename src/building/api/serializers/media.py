from urllib.parse import urlsplit
from rest_framework import serializers
from building.models import BuildingMedia


class BuildingMediaSerializer(serializers.ModelSerializer):
    class Meta:
        model = BuildingMedia
        fields = ["id", "file", "type"]

    def to_representation(self, instance):
        representation = super().to_representation(instance)

        # Use urlsplit to get the path component
        file_path = representation.get("file", "")
        url_parts = urlsplit(file_path)
        modified_file_path = url_parts.path

        representation["file"] = modified_file_path

        return representation
