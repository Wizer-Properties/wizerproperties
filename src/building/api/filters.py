import django_filters
from building.models import Building


class BuildingFilter(django_filters.FilterSet):
    lowest_price = django_filters.NumberFilter(field_name="lowest_price", lookup_expr="gte")
    highest_price = django_filters.NumberFilter(field_name="highest_price", lookup_expr="lte")

    class Meta:
        model = Building
        fields = [
            "type",
            "province",
            "have_lake_or_river_view",
            "have_guard_house",
            "have_sauna",
            "have_sky_lounge",
            "have_grocery",
            "have_fitness_area",
        ]
