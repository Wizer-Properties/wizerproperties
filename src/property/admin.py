from django import forms
from django.contrib import admin
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
    PropertyClickLog
)

admin.site.register([PropertyVisitorLocation, PropertyPriceRange])

class PropertyClickLogAdmin(admin.ModelAdmin):
    # readonly_fields = ('created_at')
    list_display = ('property', 'number_of_clicked', 'created_at')

admin.site.register(PropertyClickLog, PropertyClickLogAdmin)


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
        "interior_view",
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


@admin.register(NewlyCreatedProperty)
class NewlyCreatedPropertyAdmin(admin.ModelAdmin):
    list_display = ["id", "property", "created_at"]


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

@admin.register(DiscountProperty)
class DiscountPropertyAdmin(admin.ModelAdmin):
    list_display = ["id", "property", "period", "created_at"]
    form = DiscountPropertyForm

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

@admin.register(FeatureProperty)
class FeaturePropertyAdmin(admin.ModelAdmin):
    list_display = ["id", "property", "created_at"]
    form = FeaturePropertyForm
