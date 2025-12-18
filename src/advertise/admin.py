from django.contrib import admin
from django import forms
from advertise.models import Reel, Advertisement, AdDemography, AdvertisementLog, AdViewerLocation
from django.urls import reverse, path
from typing import Any, Dict, List, Optional
from django.utils.html import format_html
from django.http import JsonResponse
from core.admin import custom_admin_site
from advertise.api.serializers import AdAnalyticsSerializer
from django.contrib.contenttypes.models import ContentType


class AdvertisementAdminForm(forms.ModelForm):  # type: ignore[type-arg]
    """Custom form to provide a dynamic select for object_id based on chosen content_type."""
    # Use IntegerField so we don't enforce static choices server-side (JS supplies options dynamically)
    object_id = forms.IntegerField(required=False, label="Related object", widget=forms.Select())

    class Meta:
        model = Advertisement
        fields = "__all__"

    def __init__(self, *args: Any, **kwargs: Any) -> None:
        super().__init__(*args, **kwargs)
        # Initialize choices depending on current instance content_type
        ct = self.instance.content_type if self.instance and self.instance.pk else None
        # Expose endpoint for JS
        from django.urls import reverse
        try:
            self.fields["content_type"].widget.attrs["data-related-endpoint"] = reverse("admin:advertisement_related_objects")
        except Exception:
            pass
        # If editing existing instance, inject current option so it displays before JS loads
        if ct and self.instance.object_id:
            current_label = getattr(self.instance.content_object, "title", str(self.instance.content_object)) if self.instance.content_object else str(self.instance.object_id)
            # Ensure the current option appears and is selected before JS repopulates
            self.fields["object_id"].widget.choices = [("", "---------"), (self.instance.object_id, current_label)]
            self.initial["object_id"] = self.instance.object_id
            self.fields["object_id"].widget.attrs["data-current-val"] = str(self.instance.object_id)
        else:
            self.fields["object_id"].widget.choices = [("", "---------")]

    def clean(self) -> Dict[str, Any]:
        cleaned = super().clean() or {}
        ct = cleaned.get("content_type")
        obj_id = cleaned.get("object_id")
        if obj_id and not ct:
            self.add_error("content_type", "Select a content type before choosing related object.")
        if ct and obj_id:
            try:
                if ct.app_label not in {"building", "property"}:
                    self.add_error("object_id", "Unsupported content type.")
                else:
                    model_cls = ct.model_class()
                    if not model_cls.objects.filter(pk=obj_id).exists():
                        self.add_error("object_id", "Selected object does not exist for this content type.")
            except Exception:
                self.add_error("object_id", "Invalid related object.")
        return cleaned


@admin.register(Advertisement, site=custom_admin_site)
class AdvertisementAdmin(admin.ModelAdmin):  # type: ignore[type-arg]
    list_display = ["id", "content_object", "ad_location", "position", "ad_run_duration", "number_of_clicked", "_view_time", "_analytics_button", "created_at", "expired_at"]
    list_editable = ["ad_location", "position"]
    readonly_fields = ['_view_time']  # Add to instance details view
    exclude = ['view_time']  # Exclude from the add/edit form
    form = AdvertisementAdminForm
    
    class Media:
        """Add custom CSS and JavaScript for the analytics modal & dynamic object select"""
        css = {
            'all': ('admin/css/analytics_modal.css',)
        }
        js = (
            'admin/js/analytics_modal.js',
            'admin/js/advertisement_dynamic.js',
        )
    
    @admin.display(description='View time (HH:MM:SS)')
    def _view_time(self, obj: Advertisement) -> str:
        return obj.view_time_without_milliseconds()
    
    @admin.display(description='Analytics')
    def _analytics_button(self, obj: Advertisement) -> str:
        """Display analytics button for each advertisement"""
        return format_html(
            '<button type="button" class="analytics-btn" data-ad-id="{}" '
            'style="background: #007cba; color: white; border: none; padding: 5px 10px; '
            'border-radius: 3px; cursor: pointer; font-size: 12px;">📊 Analytics</button>',
            obj.id
        )
    
    def get_urls(self) -> List[Any]:
        """Add custom URL for analytics data"""
        urls = super().get_urls()
        custom_urls = [
            path('analytics-data/<int:ad_id>/', self.admin_site.admin_view(self.analytics_data_view), name='advertisement_analytics_data'),
            path('related-objects/', self.admin_site.admin_view(self.related_objects_view), name='advertisement_related_objects'),
        ]
        return custom_urls + urls
    
    def analytics_data_view(self, request: Any, ad_id: int) -> JsonResponse:
        """Return analytics data for a specific advertisement"""
        try:
            advertisement = Advertisement.objects.get(id=ad_id)
            analytics_data = AdAnalyticsSerializer(advertisement).data
            return JsonResponse(analytics_data)
            
        except Advertisement.DoesNotExist:
            return JsonResponse({'error': 'Advertisement not found'}, status=404)
        except Exception as e:
            return JsonResponse({'error': str(e)}, status=500)
    
    def changelist_view(self, request: Any, extra_context: Optional[Dict[str, Any]] = None) -> Any:
        """Add analytics modal to the changelist template"""
        extra_context = extra_context or {}
        extra_context['show_analytics_modal'] = True
        return super().changelist_view(request, extra_context)

    def related_objects_view(self, request: Any) -> JsonResponse:
        """AJAX endpoint returning object list for selected content type."""
        ct_id = request.GET.get("ct")
        results: List[Dict[str, Any]] = []
        if ct_id:
            try:
                ct = ContentType.objects.get(id=ct_id)
                if ct.app_label in {"building", "property"}:
                    model_cls = ct.model_class()
                    if model_cls:
                        # Cast to Any to avoid "Item "None" has no attribute "objects"" and similar
                        model_any: Any = model_cls
                        for obj in model_any.objects.all().only("id")[:500]:
                            label = getattr(obj, "title", str(obj))
                            results.append({"id": obj.id, "text": label})
            except ContentType.DoesNotExist:
                pass
        return JsonResponse({"results": results})


@admin.register(Reel, site=custom_admin_site)
class ReelAdmin(admin.ModelAdmin):  # type: ignore[type-arg]
    list_display = ["id", "_building", "_property", "url", "social_media", "category", "status", "created_by"]
    
    def _property(self, obj: Reel) -> str:
        if obj.property:
            link = reverse("admin:property_property_change", args=[obj.property.id]) 
            return format_html('<a href="{}" target="_blank">{}</a>', link, obj.property.title)
        return "--"
    
    def _building(self, obj: Reel) -> str:
        if obj.property and obj.property.building:
            link = reverse("admin:building_building_change", args=[obj.property.building.id])
            return format_html('<a href="{}" target="_blank">{}</a>', link, obj.property.building.title)
        return "--"
    
    def has_add_permission(self, request: Any) -> bool:
        return False
    
    def change_view(self, request: Any, object_id: str, form_url: str = '', extra_context: Optional[Dict[str, Any]] = None) -> Any:
        # Add extra context to disable the "Save and add another" button
        extra_context = extra_context or {}
        extra_context['show_save_and_continue'] = False
        extra_context['show_save_and_add_another'] = False
        extra_context['show_delete'] = False
        return super(ReelAdmin, self).change_view(request, object_id, form_url, extra_context=extra_context)
    
    def add_view(self, request: Any, form_url: str = '', extra_context: Optional[Dict[str, Any]] = None) -> Any:
        extra_context = extra_context or {}
        extra_context['show_save_and_continue'] = False
        extra_context['show_save_and_add_another'] = False
        extra_context['show_delete'] = False
        return super(ReelAdmin, self).add_view(request, form_url, extra_context=extra_context)
    

@admin.register(AdDemography, site=custom_admin_site)
class AdDemographyAdmin(admin.ModelAdmin):  # type: ignore[type-arg]
    list_display = ["id", "advertisement", "male_visitors", "female_visitors", "created_at"]

@admin.register(AdvertisementLog, site=custom_admin_site)
class AdvertisementLogAdmin(admin.ModelAdmin):  # type: ignore[type-arg]
    list_display = ["id", "content_object", "advertisement", "user_obj", "location", "created_at"]
    
@admin.register(AdViewerLocation, site=custom_admin_site)
class AdViewerLocationAdmin(admin.ModelAdmin):  # type: ignore[type-arg]
    list_display = ["id", "content_object", "advertisement", "address", "view_from_this_location", "created_at"]
