from django.contrib import admin
from .models import Building, BuildingMedia, BuildingReview
from django.utils.html import format_html
from core.admin import custom_admin_site


@admin.register(Building, site=custom_admin_site)
class BuildingAdmin(admin.ModelAdmin):
    change_list_template = 'admin/building_detail_change_list.html'
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
    def _(self, obj):
        return format_html('<a href="#/" class="building-detail-view-admin-modal-button" data-id="{}">Detail</a>', obj.id)
    
    def has_add_permission(self, request):
        return False
    
    def change_view(self, request, object_id, form_url='', extra_context=None):
        # Add extra context to disable the "Save and add another" button
        extra_context = extra_context or {}
        extra_context['show_save_and_continue'] = False
        extra_context['show_save_and_add_another'] = False
        extra_context['show_delete'] = False
        return super(BuildingAdmin, self).change_view(request, object_id, form_url, extra_context=extra_context)
    
    def add_view(self, request, form_url='', extra_context=None):
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
