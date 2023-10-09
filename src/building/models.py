from django.db import models
from django.core.validators import MinValueValidator
from utils.general_data import BUILDING_TYPES
from utils.general_func import validate_video_file_extension


class BuildingMedia(models.Model):
    image = models.ImageField(max_length=1000, null=True, upload_to="building_images/")
    floor_plan = models.ImageField(max_length=1000, null=True, upload_to="building_floor_plans/")
    unit_floor_plan = models.ImageField(max_length=1000, null=True, upload_to="building_unit_floor_plans/")
    master_plan = models.ImageField(max_length=1000, null=True, upload_to="building_master_plans/")
    video = models.FileField(upload_to="building_videos/", validators=[validate_video_file_extension])

    def __str__(self):
        return str(self.id)


class Building(models.Model):
    title = models.CharField(max_length=255, null=True)
    description = models.TextField(max_length=3000, null=True)
    price = models.DecimalField(
        max_digits=10, decimal_places=2, default=0.0, null=True, validators=[MinValueValidator(0)]
    )
    type = models.CharField(max_length=100, choices=BUILDING_TYPES, null=True)
    total_units_for_sale = models.IntegerField(default=0, null=True, validators=[MinValueValidator(0)])
    media_files = models.ManyToManyField(BuildingMedia)
    address = models.CharField(max_length=500)
    project_total_area = models.DecimalField(
        max_digits=10, decimal_places=2, default=0.0, null=True, validators=[MinValueValidator(0)]
    )
    total_floors = models.IntegerField(default=0, null=True, validators=[MinValueValidator(0)])
    construction_year = models.IntegerField(default=0, null=True, validators=[MinValueValidator(0)])
    have_lake_or_river_view = models.BooleanField(default=False)
    have_guard_house = models.BooleanField(default=False)
    have_sauna = models.BooleanField(default=False)
    have_sky_lounge = models.BooleanField(default=False)
    have_grocery = models.BooleanField(default=False)
    have_fitness_area = models.BooleanField(default=False)
    is_active = models.BooleanField(default=True)

    def __str__(self):
        return str(self.title) if self.title else str(self.id)

    def deactivate(self):
        self.is_active = False
        self.save()
