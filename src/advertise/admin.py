from django.contrib import admin
from advertise.models import Reel, Advertisement, AdDemography, AdvertisementLog
from django.urls import reverse
from django.utils.html import format_html
from core.admin import custom_admin_site


@admin.register(Advertisement, site=custom_admin_site)
class AdvertisementAdmin(admin.ModelAdmin):
    list_display = ["id", "_building", "_property", "ad_location", "position", "ad_run_duration", "number_of_clicked", "view_time", "created_at"]
    list_editable = ["ad_location", "position"]
    
    def _property(self, obj):
        if obj.property:
            link = reverse("admin:property_property_change", args=[obj.property.id]) 
            return format_html('<a href="{}" target="_blank">{}</a>', link, obj.property.title)
        return "--"
    
    def _building(self, obj):
        if obj.property and obj.property.building:
            link = reverse("admin:building_building_change", args=[obj.property.building.id])
            return format_html('<a href="{}" target="_blank">{}</a>', link, obj.property.building.title)
        return "--"


@admin.register(Reel, site=custom_admin_site)
class ReelAdmin(admin.ModelAdmin):
    list_display = ["id", "_building", "_property", "url", "social_media", "category", "status", "created_by"]
    
    def _property(self, obj):
        if obj.property:
            link = reverse("admin:property_property_change", args=[obj.property.id]) 
            return format_html('<a href="{}" target="_blank">{}</a>', link, obj.property.title)
        return "--"
    
    def _building(self, obj):
        if obj.property and obj.property.building:
            link = reverse("admin:building_building_change", args=[obj.property.building.id])
            return format_html('<a href="{}" target="_blank">{}</a>', link, obj.property.building.title)
        return "--"
    
    def has_add_permission(self, request):
        return False
    
    def change_view(self, request, object_id, form_url='', extra_context=None):
        # Add extra context to disable the "Save and add another" button
        extra_context = extra_context or {}
        extra_context['show_save_and_continue'] = False
        extra_context['show_save_and_add_another'] = False
        extra_context['show_delete'] = False
        return super(ReelAdmin, self).change_view(request, object_id, form_url, extra_context=extra_context)
    
    def add_view(self, request, form_url='', extra_context=None):
        extra_context = extra_context or {}
        extra_context['show_save_and_continue'] = False
        extra_context['show_save_and_add_another'] = False
        extra_context['show_delete'] = False
        return super(ReelAdmin, self).add_view(request, form_url, extra_context=extra_context)
    

# @admin.register(AdDemography)
# class AdDemographyAdmin(admin.ModelAdmin):
#     list_display = ["id", "advertisement", "male_visitors", "female_visitors", "created_at"]

# @admin.register(AdvertisementLog)
# class AdvertisementLogAdmin(admin.ModelAdmin):
#     list_display = ["id", "property", "advertisement", "user_obj", "location", "created_at"]
