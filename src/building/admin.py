from django.contrib import admin
from .models import Building, BuildingMedia, BuildingReview


@admin.register(Building)
class BuildingAdmin(admin.ModelAdmin):
    list_display = [
        "title",
        "type",
        "sub_type",
        "status",
        "furnishing",
        "lowest_price",
        "highest_price",
        "total_units_for_sale",
        "address",
        "is_active",
        
    ]

#"created_by", "created_at", "have_freehold","have_leasehold", "project_total_area", "have_infinity_pool","have_pets_allowed","have_guard_house","have_sauna","have_sky_lounge","have_grocery","have_fitness_area", "distance_from_location_to_BTS_or_MRT", "distance_from_location_to_ARL", "province", "district", "sub_district", "view", "construction_year", "total_floors", "quota",
        
# @admin.register(BuildingMedia)
# class BuildingMediaAdmin(admin.ModelAdmin):
#     list_display = ["id", "type", "building", "created_at"]


# @admin.register(BuildingReview)
# class BuildingReviewAdmin(admin.ModelAdmin):
#     list_display = ["id", "user", "building", "rating", "review_text", "is_active", "created_at"]
