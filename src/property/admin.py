from django import forms
from django.contrib import admin
from django.utils.html import format_html
from django.urls import reverse
from django.utils import timezone

from .models import (
    Property,
    PropertyMedia,
    CompareProperty,
    ProspectFavoriteProperty,
    NewlyCreatedProperty,
    DiscountProperty,
    FeatureProperty,
    PropertyVisitorLocation,
    PropertyPriceRange,
    PropertyClicksLog,
    PropertyVisitLog
)
from core.admin import custom_admin_site

#custom_admin_site.register([PropertyVisitorLocation, PropertyPriceRange, PropertyVisitLog])

# class PropertyClicksLogAdmin(admin.ModelAdmin):
#     # readonly_fields = ('created_at')
#     list_display = ('property', 'number_of_clicked', 'created_at')

# custom_admin_site.register(PropertyClicksLog, PropertyClicksLogAdmin)


@admin.register(Property, site=custom_admin_site)
class PropertyAdmin(admin.ModelAdmin):
    change_list_template = 'admin/property_detail_change_list.html'
    list_display = [
        "id",
        "_building",
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
        "is_active",
        "_"
    ]
    
    def _(self, obj):
        return format_html('<a href="#/" class="property-detail-view-admin-modal-button" data-id="{}">Detail</a>', obj.id)
    
    def _building(self, obj):
        if obj.building:
            link = reverse("admin:building_building_change", args=[obj.building.id])
            return format_html('<a href="{}" target="_blank">{}</a>', link, obj.building.title)
        return "--"
    
    def has_add_permission(self, request):
        return False
    
    def change_view(self, request, object_id, form_url='', extra_context=None):
        # Add extra context to disable the "Save and add another" button
        extra_context = extra_context or {}
        extra_context['show_save_and_continue'] = False
        extra_context['show_save_and_add_another'] = False
        extra_context['show_delete'] = False
        return super(PropertyAdmin, self).change_view(request, object_id, form_url, extra_context=extra_context)
    
    def add_view(self, request, form_url='', extra_context=None):
        extra_context = extra_context or {}
        extra_context['show_save_and_continue'] = False
        extra_context['show_save_and_add_another'] = False
        extra_context['show_delete'] = False
        return super(PropertyAdmin, self).add_view(request, form_url, extra_context=extra_context)


#@admin.register(PropertyMedia, site=custom_admin_site)
#class PropertyMediaAdmin(admin.ModelAdmin):
#    list_display = ["id", "type", "property", "created_at"]


# @admin.register(CompareProperty)
# class ComparePropertyAdmin(admin.ModelAdmin):
#     list_display = ["id", "user", "property", "created_at"]


# @admin.register(ProspectFavoriteProperty)
# class ProspectFavoritePropertyAdmin(admin.ModelAdmin):
#     list_display = ["id", "prospect", "property", "created_at"]


# @admin.register(NewlyCreatedProperty)
# class NewlyCreatedPropertyAdmin(admin.ModelAdmin):
#     list_display = ["id", "property", "created_at"]


class DiscountPropertyForm(forms.ModelForm):
    class Meta:
        model = DiscountProperty
        fields = '__all__'

    def __init__(self, *args, **kwargs):
        super().__init__(*args, **kwargs)
        # Query properties that are not already associated with FeatureProperty or DiscountProperty
        queryset = Property.objects.exclude(
            discounts__isnull=False
        ).exclude(
            features__isnull=False
        )

        if self.instance and self.instance.property:
            # Adding the current properties with queryset
            queryset = queryset | Property.objects.filter(pk=self.instance.property.pk)

        self.fields['property'].queryset = queryset

@admin.register(DiscountProperty, site=custom_admin_site)
class DiscountPropertyAdmin(admin.ModelAdmin):
    list_display = ["id", "_building", "_property", "period", "number_of_clicked", "view_time", "created_at", "_status"]
    form = DiscountPropertyForm
    
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
    
    def _status(self, obj):
        if obj.period >= timezone.now().date():
            return "Active"
        return "Inactive"

class FeaturePropertyForm(forms.ModelForm):
    class Meta:
        model = FeatureProperty
        fields = '__all__'

    def __init__(self, *args, **kwargs):
        super().__init__(*args, **kwargs)
        # Query properties that are not already associated with FeatureProperty or DiscountProperty
        queryset = Property.objects.exclude(
            discounts__isnull=False
        ).exclude(
            features__isnull=False
        )

        if self.instance and self.instance.property:
            # Adding the current properties with queryset
            queryset = queryset | Property.objects.filter(pk=self.instance.property.pk)

        self.fields['property'].queryset = queryset
        

@admin.register(FeatureProperty, site=custom_admin_site)
class FeaturePropertyAdmin(admin.ModelAdmin):
    list_display = ["id", "_building", "_property", "number_of_clicked", "view_time", "created_at"]
    form = FeaturePropertyForm
    
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


