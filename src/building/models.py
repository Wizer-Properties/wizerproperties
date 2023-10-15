from django.db import models
from django.core.exceptions import ValidationError
from django.core.validators import MinValueValidator
from utils.general_data import BUILDING_TYPES, BUILDING_MEDIA_TYPES
from utils.general_func import validate_media_file_extension
from core.models import TimestampedModel


class Building(TimestampedModel):
    title = models.CharField(max_length=255, null=True)
    description = models.TextField(max_length=3000, null=True)
    price = models.DecimalField(
        max_digits=10, decimal_places=2, default=0, null=True, validators=[MinValueValidator(1)]
    )
    type = models.CharField(max_length=100, choices=BUILDING_TYPES, null=True)
    total_units_for_sale = models.IntegerField(default=0, null=True, validators=[MinValueValidator(1)])
    address = models.CharField(max_length=500, null=True)
    project_total_area = models.FloatField(default=0, null=True, validators=[MinValueValidator(1)])
    total_floors = models.IntegerField(default=0, null=True, validators=[MinValueValidator(1)])
    construction_year = models.IntegerField(default=1930, null=True, validators=[MinValueValidator(1930)])
    have_lake_or_river_view = models.BooleanField(default=False)
    have_guard_house = models.BooleanField(default=False)
    have_sauna = models.BooleanField(default=False)
    have_sky_lounge = models.BooleanField(default=False)
    have_grocery = models.BooleanField(default=False)
    have_fitness_area = models.BooleanField(default=False)
    is_active = models.BooleanField(default=True)
    created_by = models.ForeignKey("user.User", on_delete=models.SET_NULL, null=True)

    def __str__(self):
        return str(self.title) if self.title else str(self.id)

    def inactive(self):
        self.is_active = False
        self.save()


class BuildingMedia(TimestampedModel):
    def upload_to(self, filename):
        # Handle upload path based on media type (image, video, etc.)
        if self.type in ["image", "floor_plan", "unit_floor_plan", "master_plan"]:
            return "building/images/{}".format(filename)
        elif self.type == "video":
            return "building/videos/{}".format(filename)
        else:
            raise ValidationError("Invalid media type")

    type = models.CharField(max_length=100, null=True, choices=BUILDING_MEDIA_TYPES)
    file = models.FileField(null=True, upload_to=upload_to)
    building = models.ForeignKey(Building, on_delete=models.CASCADE, null=True, related_name="media_files")

    def __str__(self):
        return str(self.id)

    def clean(self):
        if self.type in [
            "image",
            "floor_plan",
            "unit_floor_plan",
            "master_plan",
        ]:
            allowed_image_extensions = [
                "jpg",
                "jpeg",
                "png",
                "gif",
                "bmp",
                "tiff",
                "webp",
                "svg",
                "heif",
                "bat",
                "raw",
                "indd",
                "ai",
            ]
            validate_media_file_extension(self.file, allowed_image_extensions)
        elif self.type == "video":
            allowed_video_extensions = ["mp4", "avi", "mov", "wmv", "mkv", "flv"]
            validate_media_file_extension(self.file, allowed_video_extensions)
        else:
            raise ValidationError("Invalid media type")
