from django.contrib import admin
from .models import Building, BuildingMedia, BuildingReview, PopularBuilding


@admin.register(Building)
class BuildingAdmin(admin.ModelAdmin):
    list_display = [
        "id",
        "title",
        "lowest_price",
        "highest_price",
        "type",
        "total_units_for_sale",
        "province",
        "district",
        "sub_district",
        "address",
        "latitude",
        "longitude",
        "project_total_area",
        "total_floors",
        "construction_year",
        "quota",
        "furnishing",
        "have_access_to_BTS_or_MRT",
        "have_access_to_ARL",
        "view",
        "have_freehold",
        "have_leasehold",
        "have_infinity_pool",
        "have_pets_allowed",
        "have_guard_house",
        "have_sauna",
        "have_sky_lounge",
        "have_grocery",
        "have_fitness_area",
        "is_active",
        "created_by",
        "created_at",
    ]


@admin.register(BuildingMedia)
class BuildingMediaAdmin(admin.ModelAdmin):
    list_display = ["id", "type", "building", "created_at"]


@admin.register(BuildingReview)
class BuildingReviewAdmin(admin.ModelAdmin):
    list_display = ["id", "user", "building", "rating", "review_text", "is_active", "created_at"]


@admin.register(PopularBuilding)
class PopularBuildingAdmin(admin.ModelAdmin):
    list_display = ["id", "building", "created_at"]
