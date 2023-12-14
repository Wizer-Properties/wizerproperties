import django_filters
from django.contrib.gis.db.models.functions import Distance
from django.contrib.gis.geos import Point
from property.models import Property


class PropertyFilter(django_filters.FilterSet):
    min_price = django_filters.NumberFilter(field_name="price", lookup_expr="gte")
    max_price = django_filters.NumberFilter(field_name="price", lookup_expr="lte")
    min_price_per_sqm = django_filters.NumberFilter(field_name="price_per_sqm", lookup_expr="gte")
    max_price_per_sqm = django_filters.NumberFilter(field_name="price_per_sqm", lookup_expr="lte")
    min_unit_area = django_filters.NumberFilter(field_name="unit_area", lookup_expr="gte")
    max_unit_area = django_filters.NumberFilter(field_name="unit_area", lookup_expr="lte")
    nearby = django_filters.NumberFilter(method="filter_nearby", label="Nearby (miles)")

    class Meta:
        model = Property
        fields = [
            "building__type",
            "number_of_bedroom",
            "number_of_bathroom",
            "number_of_balcony",
            "number_of_car_parking",
            "balcony_direction",
            "main_door_direction",
            "unit_position",
            "have_access_to_BTS_or_MRT",
            "have_access_to_ARL",
            "have_tenant_occupied",
            "have_vacant",
            "have_owner_occupied",
            "have_bathtub",
            "have_duplex",
            "newly_created",
            "building__quota",
            "building__furnishing",
            "building__have_freehold",
            "building__have_leasehold",
            "building__have_river_view",
            "building__have_unblocked_view",
            "building__have_city_view",
            "building__have_sea_view",
            "building__have_mountain_view",
            "building__have_infinity_pool",
            "building__have_pets_allowed",
            "building__have_guard_house",
            "building__have_sauna",
            "building__have_sky_lounge",
            "building__have_grocery",
            "building__have_fitness_area",
        ]

    def filter_nearby(self, queryset, name, value):
        if self.request and "lat" in self.request.query_params and "long" in self.request.query_params:
            lat = float(self.request.query_params.get("lat"))
            long = float(self.request.query_params.get("long"))
            point = Point(long, lat, srid=32647)  # Asian 1985 or UTM Zone 47N coordinate system

            return (
                queryset.filter(building__latitude__isnull=False, building__longitude__isnull=False)
                .annotate(nearby=Distance(Point("building__longitude", "building__latitude", srid=32647), point))
                .filter(nearby__lte=value)
            )
        return queryset
