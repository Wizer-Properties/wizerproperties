from django.contrib import admin
from typing import Any, Dict, Optional
from .models import Building, BuildingMedia, BuildingReview
from django.utils.html import format_html
from core.admin import custom_admin_site


class BuildingMediaInline(admin.TabularInline):  # type: ignore[type-arg]
    model = BuildingMedia
    extra = 0
    readonly_fields = ("type", "link", "created_at")
    fields = ("type", "link", "created_at")
    can_delete = False
    show_change_link = True

    @admin.display(description="Link")
    def link(self, obj: BuildingMedia) -> str:
        if obj.file:
            return format_html(
                '<a href="{}" target="_blank">Link</a>', 
                obj.file.url
            )
       
        return "--"


@admin.register(Building, site=custom_admin_site)
class BuildingAdmin(admin.ModelAdmin):  # type: ignore[type-arg]
    change_list_template = 'admin/building_detail_change_list.html'
    inlines = [BuildingMediaInline]
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
        "_"
    ]
    
    # Details link buttons
    def _(self, obj: Building) -> str:
        return format_html('<a href="#/" class="building-detail-view-admin-modal-button" data-id="{}">Detail</a>', obj.id)
    
    # def has_add_permission(self, request):
    #     return False
    
    def change_view(self, request: Any, object_id: str, form_url: str = '', extra_context: Optional[Dict[str, Any]] = None) -> Any:
        # Add extra context to disable the "Save and add another" button
        extra_context = extra_context or {}
        extra_context['show_save_and_continue'] = False
        extra_context['show_save_and_add_another'] = False
        extra_context['show_delete'] = False
        return super(BuildingAdmin, self).change_view(request, object_id, form_url, extra_context=extra_context)
    
    def add_view(self, request: Any, form_url: str = '', extra_context: Optional[Dict[str, Any]] = None) -> Any:
        extra_context = extra_context or {}
        extra_context['show_save_and_continue'] = False
        extra_context['show_save_and_add_another'] = False
        extra_context['show_delete'] = False
        return super(BuildingAdmin, self).add_view(request, form_url, extra_context=extra_context)
    

#"created_by", "created_at", "have_freehold","have_leasehold", "project_total_area", "have_infinity_pool","have_pets_allowed","have_guard_house","have_sauna","have_sky_lounge","have_grocery","have_fitness_area", "distance_from_location_to_BTS_or_MRT", "distance_from_location_to_ARL", "province", "district", "sub_district", "view", "construction_year", "total_floors", "quota",
        
# @admin.register(BuildingMedia)
# class BuildingMediaAdmin(admin.ModelAdmin):
#     list_display = ["id", "type", "building", "created_at"]


# @admin.register(BuildingReview)
# class BuildingReviewAdmin(admin.ModelAdmin):
#     list_display = ["id", "user", "building", "rating", "review_text", "is_active", "created_at"]
