from django.contrib import admin
from .models import (
    Property,
    PropertyMedia,
    CompareProperty,
    ProspectFavoriteProperty,
    PopularProperty,
    NewlyCreatedProperty,
    DiscountProperty,
)


@admin.register(Property)
class PropertyAdmin(admin.ModelAdmin):
    list_display = [
        "id",
        "building",
        "unit_id",
        "title",
        "price",
        "price_per_sqm",
        "floor_number",
        "unit_area",
        "number_of_bedroom",
        "number_of_bathroom",
        "number_of_balcony",
        "number_of_car_parking",
        "balcony_direction",
        "main_door_direction",
        "unit_position",
        "have_tenant_occupied",
        "tenant_occupied_validity",
        "have_vacant",
        "have_owner_occupied",
        "have_bathtub",
        "have_duplex",
        "is_active",
        "created_by",
        "created_at",
    ]


@admin.register(PropertyMedia)
class PropertyMediaAdmin(admin.ModelAdmin):
    list_display = ["id", "type", "property", "created_at"]


@admin.register(CompareProperty)
class ComparePropertyAdmin(admin.ModelAdmin):
    list_display = ["id", "user", "property", "created_at"]


@admin.register(ProspectFavoriteProperty)
class ProspectFavoritePropertyAdmin(admin.ModelAdmin):
    list_display = ["id", "prospect", "property", "created_at"]


@admin.register(PopularProperty)
class PopularPropertyAdmin(admin.ModelAdmin):
    list_display = ["id", "property", "created_at"]


@admin.register(NewlyCreatedProperty)
class NewlyCreatedPropertyAdmin(admin.ModelAdmin):
    list_display = ["id", "property", "created_at"]


@admin.register(DiscountProperty)
class DiscountPropertyAdmin(admin.ModelAdmin):
    list_display = ["id", "property", "period", "created_at"]
