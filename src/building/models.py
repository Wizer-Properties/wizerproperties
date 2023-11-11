from django.db import models
from django.core.exceptions import ValidationError
from django.core.validators import MinValueValidator
from utils.general_data import BUILDING_TYPES, BUILDING_MEDIA_TYPES, ALLOWED_IMAGE_EXTENSIONS, ALLOWED_VIDEO_EXTENSIONS
from utils.general_func import validate_media_file_extension
from core.models import TimestampedModel


class Building(TimestampedModel):
    title = models.CharField(max_length=255, null=True)
    description = models.TextField(max_length=3000, null=True)
    price = models.DecimalField(
        max_digits=20, decimal_places=2, default=0, null=True, validators=[MinValueValidator(1)]
    )
    type = models.CharField(max_length=100, choices=BUILDING_TYPES, null=True)
    total_units_for_sale = models.IntegerField(default=0, null=True, validators=[MinValueValidator(1)])
    province = models.CharField(max_length=500, null=True)
    district = models.CharField(max_length=500, null=True)
    sub_district = models.CharField(max_length=500, null=True)
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


class BuildingMedia(TimestampedModel):
    def upload_to(self, filename):
        # Handle upload path based on media type (image, video, etc.)
        if self.type in ["image", "floor_plan", "unit_floor_plan", "master_plan"]:
            return "building/images/{}".format(filename)
        elif self.type == "video":
            return "building/videos/{}".format(filename)

    type = models.CharField(max_length=100, null=True, choices=BUILDING_MEDIA_TYPES)
    file = models.FileField(null=True, upload_to=upload_to)
    building = models.ForeignKey(Building, on_delete=models.CASCADE, null=True, related_name="media_files")

    def __str__(self):
        return str(self.id)

    def clean(self):
        allowed_extensions = None
        if self.type in [
            "image",
            "floor_plan",
            "unit_floor_plan",
            "master_plan",
        ]:
            allowed_extensions = ALLOWED_IMAGE_EXTENSIONS
        elif self.type == "video":
            allowed_extensions = ALLOWED_VIDEO_EXTENSIONS

        if allowed_extensions:
            validate_media_file_extension(self.file, allowed_extensions)
        else:
            raise ValidationError("Invalid media type")


class BuildingReview(TimestampedModel):
    RATING_CHOICES = (
        (1, '1'),
        (2, '2'),
        (3, '3'),
        (4, '4'),
        (5, '5'),
    )
    
    user = models.ForeignKey("user.User", on_delete=models.SET_NULL, null=True)
    building = models.ForeignKey(Building, on_delete=models.CASCADE, null=True)
    rating = models.IntegerField(choices=RATING_CHOICES, default=0)
    review_text = models.TextField(blank=True, null=True, max_length=1000)
    is_active = models.BooleanField(default=True)
    
    def clean(self, *args, **kwargs):
        super().clean()
        
        # Duplication check
        is_exists = BuildingReview.objects.filter(
            user=self.user,
            building=self.building,
        ).exists()
        if is_exists:
            raise ValidationError("This building has been previously reviewed.")
        
    