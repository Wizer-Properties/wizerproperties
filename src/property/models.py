from django.db import models
from core.models import TimestampedModel
from django.core.exceptions import ValidationError
from django.core.validators import MinValueValidator
from utils.general_data import PROPERTY_MEDIA_TYPES, ALLOWED_IMAGE_EXTENSIONS, ALLOWED_VIDEO_EXTENSIONS
from utils.general_func import validate_media_file_extension


class Property(TimestampedModel):
    building = models.ForeignKey("building.Building", on_delete=models.SET_NULL, null=True)
    unit_id = models.CharField(max_length=100, null=True)
    title = models.CharField(max_length=255, null=True)
    description = models.TextField(max_length=3000, null=True)
    price = models.DecimalField(
        max_digits=10, decimal_places=2, default=0, null=True, validators=[MinValueValidator(0.01)]
    )
    floor_number = models.CharField(max_length=255, null=True)
    unit_area = models.FloatField(default=0, null=True, validators=[MinValueValidator(1)])
    number_of_bedroom = models.IntegerField(default=0, null=True, validators=[MinValueValidator(1)])
    number_of_bathroom = models.IntegerField(default=0, null=True, validators=[MinValueValidator(1)])
    number_of_balcony = models.IntegerField(default=0, null=True, validators=[MinValueValidator(1)])
    number_of_car_parking = models.IntegerField(default=0, null=True, validators=[MinValueValidator(1)])
    is_active = models.BooleanField(default=True)
    created_by = models.ForeignKey("user.User", on_delete=models.SET_NULL, null=True)

    class Meta:
        verbose_name_plural = "properties"

    def __str__(self):
        return str(self.title) if self.title else str(self.id)

    def inactive(self):
        self.is_active = False
        self.save()


class PropertyMedia(TimestampedModel):
    def upload_to(self, filename):
        # Handle upload path based on media type (image, video, etc.)
        if self.type in ["image", "unit_floor_plan"]:
            return "property/images/{}".format(filename)
        elif self.type == "video":
            return "property/videos/{}".format(filename)

    type = models.CharField(max_length=100, null=True, choices=PROPERTY_MEDIA_TYPES)
    file = models.FileField(null=True, upload_to=upload_to)
    property = models.ForeignKey(Property, on_delete=models.CASCADE, null=True, related_name="media_files")

    def __str__(self):
        return str(self.id)

    def clean(self):
        allowed_extensions = None
        if self.type in [
            "image",
            "unit_floor_plan",
        ]:
            allowed_extensions = ALLOWED_IMAGE_EXTENSIONS
        elif self.type == "video":
            allowed_extensions = ALLOWED_VIDEO_EXTENSIONS

        if allowed_extensions:
            validate_media_file_extension(self.file, allowed_extensions)
        else:
            raise ValidationError("Invalid media type")
