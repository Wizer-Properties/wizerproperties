from django.db import models
from django.core.exceptions import ValidationError
from utils.general_data import BUILDING_MEDIA_TYPES, ALLOWED_IMAGE_EXTENSIONS, ALLOWED_VIDEO_EXTENSIONS
from utils.general_func import validate_media_file_extension
from core.models import TimestampedModel
from .default import Building


class BuildingMedia(TimestampedModel):
    def upload_to(self, filename):
        # Handle upload path based on media type (image, video, etc.)
        if self.type in ["image", "floor_plan", "unit_floor_plan", "master_plan"]:
            return "building/images/{}".format(filename)
        elif self.type in ["video", "aerial_drone_video"]:
            return "building/videos/{}".format(filename)

    type = models.CharField(max_length=100, null=True, choices=BUILDING_MEDIA_TYPES)
    file = models.FileField(null=True, upload_to=upload_to)
    building = models.ForeignKey(Building, on_delete=models.CASCADE, null=True, related_name="media_files")

    def __str__(self):
        return str(self.id)

    def clean(self):
        allowed_extensions = None
        if self.type in ["image", "floor_plan", "unit_floor_plan", "master_plan"]:
            allowed_extensions = ALLOWED_IMAGE_EXTENSIONS
        elif self.type in ["video", "aerial_drone_video"]:
            allowed_extensions = ALLOWED_VIDEO_EXTENSIONS

        if allowed_extensions:
            validate_media_file_extension(self.file, allowed_extensions)
        else:
            raise ValidationError("Invalid media type")
