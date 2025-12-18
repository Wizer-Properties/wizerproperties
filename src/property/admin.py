from typing import Any, Dict, Optional
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

class PropertyMediaInline(admin.TabularInline):  # type: ignore[type-arg]
    model = PropertyMedia
    extra = 0
    readonly_fields = ("type", "link", "created_at")
    fields = ("type", "link", "created_at")
    can_delete = False
    show_change_link = True

    @admin.display(description="Link")
    def link(self, obj: PropertyMedia) -> str:
        if obj.file:
            return format_html(
                '<a href="{}" target="_blank">Link</a>', 
                obj.file.url
            )
       
        return "--"


@admin.register(Property, site=custom_admin_site)
class PropertyAdmin(admin.ModelAdmin):  # type: ignore[type-arg]
    change_list_template = 'admin/property_detail_change_list.html'
    inlines = [PropertyMediaInline]
    list_display = [
        "id",
        "_building",
        "unit_id",
        "title",
        "_price",
        "_price_per_sqm",
        "floor_number",
        "unit_area",
        "number_of_bedroom",
        "number_of_bathroom",
        "number_of_balcony",
        "number_of_car_parking",
        "is_active",
        "_"
    ]
    
    def _(self, obj: Property) -> str:
        return format_html('<a href="#/" class="property-detail-view-admin-modal-button" data-id="{}">Detail</a>', obj.id)
    
    def _building(self, obj: Property) -> str:
        if obj.building:
            link = reverse("admin:building_building_change", args=[obj.building.id])
            return format_html('<a href="{}" target="_blank">{}</a>', link, obj.building.title)
        return "--"
    
    @admin.display(description="Price")
    def _price(self, obj: Property) -> str:
        if obj.price:
            return f"{obj.price:,.2f} THB"
        return "--"
    
    @admin.display(description="Price per SQM")
    def _price_per_sqm(self, obj: Property) -> str:
        if obj.price_per_sqm:
            return f"{obj.price_per_sqm:,.2f} THB"
        return "--"
    
    def has_add_permission(self, request: Any) -> bool:
        return False
    
    def change_view(self, request: Any, object_id: str, form_url: str = '', extra_context: Optional[Dict[str, Any]] = None) -> Any:
        # Add extra context to disable the "Save and add another" button
        extra_context = extra_context or {}
        extra_context['show_save_and_continue'] = False
        extra_context['show_save_and_add_another'] = False
        extra_context['show_delete'] = False
        return super(PropertyAdmin, self).change_view(request, object_id, form_url, extra_context=extra_context)
    
    def add_view(self, request: Any, form_url: str = '', extra_context: Optional[Dict[str, Any]] = None) -> Any:
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


class DiscountPropertyForm(forms.ModelForm):  # type: ignore[type-arg]
    class Meta:
        model = DiscountProperty
        fields = '__all__'

    def __init__(self, *args: Any, **kwargs: Any) -> None:
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

        field = self.fields['property']
        if hasattr(field, 'queryset'):
            field.queryset = queryset

@admin.register(DiscountProperty, site=custom_admin_site)
class DiscountPropertyAdmin(admin.ModelAdmin):  # type: ignore[type-arg]
    list_display = ["id", "_building", "_property", "period", "_number_of_clicked", "_view_time", "created_by", "created_at", "_status"]
    form = DiscountPropertyForm
    list_filter = ["period", "created_at", "created_by"]
    search_fields = ["property__title", "property__building__title", "created_by__username"]
    
    def _property(self, obj: DiscountProperty) -> str:
        if obj.property:
            link = reverse("admin:property_property_change", args=[obj.property.id]) 
            return format_html('<a href="{}" target="_blank">{}</a>', link, obj.property.title)
        return "--"
    
    def _building(self, obj: DiscountProperty) -> str:
        if obj.property and obj.property.building:
            link = reverse("admin:building_building_change", args=[obj.property.building.id])
            return format_html('<a href="{}" target="_blank">{}</a>', link, obj.property.building.title)
        return "--"
    
    @admin.display(description="Number of Clicks")
    def _number_of_clicked(self, obj: DiscountProperty) -> int:
        return obj.number_of_clicked
    
    def _status(self, obj: DiscountProperty) -> str:
        if obj.period and obj.period >= timezone.now().date():
            return "Active"
        return "Inactive"
    
    def _view_time(self, obj: DiscountProperty) -> str:
        return obj.duration_without_microseconds()

class FeaturePropertyForm(forms.ModelForm):  # type: ignore[type-arg]
    class Meta:
        model = FeatureProperty
        fields = '__all__'

    def __init__(self, *args: Any, **kwargs: Any) -> None:
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

        field = self.fields['property']
        if hasattr(field, 'queryset'):
            field.queryset = queryset
        

@admin.register(FeatureProperty, site=custom_admin_site)
class FeaturePropertyAdmin(admin.ModelAdmin):  # type: ignore[type-arg]
    list_display = ["id", "_building", "_property", "expiry_date", "_number_of_clicked", "_view_time", "created_by", "created_at", "_status"]
    form = FeaturePropertyForm
    list_filter = ["expiry_date", "created_at", "created_by"]
    search_fields = ["property__title", "property__building__title", "created_by__username"]
    
    def _property(self, obj: FeatureProperty) -> str:
        if obj.property:
            link = reverse("admin:property_property_change", args=[obj.property.id]) 
            return format_html('<a href="{}" target="_blank">{}</a>', link, obj.property.title)
        return "--"
    
    def _building(self, obj: FeatureProperty) -> str:
        if obj.property and obj.property.building:
            link = reverse("admin:building_building_change", args=[obj.property.building.id])
            return format_html('<a href="{}" target="_blank">{}</a>', link, obj.property.building.title)
        return "--"
    
    @admin.display(description="Number of Clicks")
    def _number_of_clicked(self, obj: FeatureProperty) -> int:
        return obj.number_of_clicked
    
    def _status(self, obj: FeatureProperty) -> str:
        if obj.expiry_date and obj.expiry_date >= timezone.now().date():
            return "Active"
        elif obj.expiry_date:
            return "Expired"
        return "No Expiry"
    
    def _view_time(self, obj: FeatureProperty) -> str:
        return obj.duration_without_microseconds()


