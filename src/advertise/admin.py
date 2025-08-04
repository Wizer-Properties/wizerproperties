from django.contrib import admin
from advertise.models import Reel, Advertisement, AdDemography, AdvertisementLog, AdViewerLocation
from django.urls import reverse, path
from django.utils.html import format_html
from django.http import JsonResponse
from core.admin import custom_admin_site
from advertise.api.serializers import AdAnalyticsSerializer


@admin.register(Advertisement, site=custom_admin_site)
class AdvertisementAdmin(admin.ModelAdmin):
    list_display = ["id", "_building", "_property", "ad_location", "position", "ad_run_duration", "number_of_clicked", "_view_time", "_analytics_button", "created_at"]
    list_editable = ["ad_location", "position"]
    readonly_fields = ['_view_time']  # Add to instance details view
    exclude = ['view_time']  # Exclude from the add/edit form
    
    class Media:
        """Add custom CSS and JavaScript for the analytics modal"""
        css = {
            'all': ('admin/css/analytics_modal.css',)
        }
        js = ('admin/js/analytics_modal.js',)
    
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
    
    @admin.display(description='View time (HH:MM:SS)')
    def _view_time(self, obj):
        return obj.view_time_without_milliseconds()
    
    @admin.display(description='Analytics')
    def _analytics_button(self, obj):
        """Display analytics button for each advertisement"""
        return format_html(
            '<button type="button" class="analytics-btn" data-ad-id="{}" '
            'style="background: #007cba; color: white; border: none; padding: 5px 10px; '
            'border-radius: 3px; cursor: pointer; font-size: 12px;">📊 Analytics</button>',
            obj.id
        )
    
    def get_urls(self):
        """Add custom URL for analytics data"""
        urls = super().get_urls()
        custom_urls = [
            path('analytics-data/<int:ad_id>/', self.admin_site.admin_view(self.analytics_data_view), name='advertisement_analytics_data'),
        ]
        return custom_urls + urls
    
    def analytics_data_view(self, request, ad_id):
        """Return analytics data for a specific advertisement"""
        try:
            advertisement = Advertisement.objects.get(id=ad_id)
            analytics_data = AdAnalyticsSerializer(advertisement).data
            return JsonResponse(analytics_data)
            
        except Advertisement.DoesNotExist:
            return JsonResponse({'error': 'Advertisement not found'}, status=404)
        except Exception as e:
            return JsonResponse({'error': str(e)}, status=500)
    
    def changelist_view(self, request, extra_context=None):
        """Add analytics modal to the changelist template"""
        extra_context = extra_context or {}
        extra_context['show_analytics_modal'] = True
        return super().changelist_view(request, extra_context)


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
    

@admin.register(AdDemography, site=custom_admin_site)
class AdDemographyAdmin(admin.ModelAdmin):
    list_display = ["id", "advertisement", "male_visitors", "female_visitors", "created_at"]

@admin.register(AdvertisementLog, site=custom_admin_site)
class AdvertisementLogAdmin(admin.ModelAdmin):
    list_display = ["id", "property", "advertisement", "user_obj", "location", "created_at"]
    
@admin.register(AdViewerLocation, site=custom_admin_site)
class AdViewerLocation(admin.ModelAdmin):
    list_display = ["id", "property", "advertisement", "address", "view_from_this_location", "created_at"]
