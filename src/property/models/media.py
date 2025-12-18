from typing import Any, List, Optional
from django.db import models
from core.models import TimestampedModel
from django.core.exceptions import ValidationError
from utils.general_data import PROPERTY_MEDIA_TYPES, ALLOWED_IMAGE_EXTENSIONS, ALLOWED_VIDEO_EXTENSIONS
from utils.general_func import validate_media_file_extension


class PropertyMedia(TimestampedModel):
    def upload_to(self, filename: str) -> str:
        # Handle upload path based on media type (image, video, etc.)
        if self.type == "image":
            return "property/images/{}".format(filename)
        elif self.type in ["video"]:
            return "property/videos/{}".format(filename)
        return "property/others/{}".format(filename)

    type = models.CharField(max_length=100, null=True, choices=PROPERTY_MEDIA_TYPES)
    file = models.FileField(null=True, upload_to=upload_to)
    property = models.ForeignKey("property.Property", on_delete=models.CASCADE, null=True, related_name="media_files")

    def __str__(self) -> str:
        return str(self.id)

    def clean(self) -> None:
        allowed_extensions: Optional[List[str]] = None
        if self.type == "image":
            allowed_extensions = ALLOWED_IMAGE_EXTENSIONS
        elif self.type in ["video"]:
            allowed_extensions = ALLOWED_VIDEO_EXTENSIONS

        if allowed_extensions:
            validate_media_file_extension(self.file, allowed_extensions)
        else:
            raise ValidationError("Invalid media type")
