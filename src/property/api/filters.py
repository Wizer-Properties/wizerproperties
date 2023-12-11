import django_filters
from property.models import Property


class PropertyFilter(django_filters.FilterSet):
    min_price = django_filters.NumberFilter(field_name="price", lookup_expr="gte")
    max_price = django_filters.NumberFilter(field_name="price", lookup_expr="lte")
    min_price_per_sqm = django_filters.NumberFilter(field_name="price_per_sqm", lookup_expr="gte")
    max_price_per_sqm = django_filters.NumberFilter(field_name="price_per_sqm", lookup_expr="lte")
    min_unit_area = django_filters.NumberFilter(field_name="unit_area", lookup_expr="gte")
    max_unit_area = django_filters.NumberFilter(field_name="unit_area", lookup_expr="lte")

    class Meta:
        model = Property
        fields = [
            "building__type",
            "number_of_bedroom",
            "number_of_bathroom",
            "number_of_balcony",
            "number_of_car_parking",
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
