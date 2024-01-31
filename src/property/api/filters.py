import django_filters
from geopy.distance import geodesic
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
            "have_tenant_occupied",
            "have_vacant",
            "have_owner_occupied",
            "have_bathtub",
            "have_duplex",
            "building__quota",
            "building__furnishing",
            "building__have_access_to_BTS_or_MRT",
            "building__have_access_to_ARL",
            "building__view",
            "building__have_freehold",
            "building__have_leasehold",
            "building__have_infinity_pool",
            "building__have_pets_allowed",
            "building__have_guard_house",
            "building__have_sauna",
            "building__have_sky_lounge",
            "building__have_grocery",
            "building__have_fitness_area",
        ]

    def filter_nearby(self, queryset, name, value):
        """
        N.B >>>
            We have decided to iterate through the objects in a loop and get results.
            However, if the number of properties increases, find a better solution to optimize performance
            and reduce the processing time within a nearby distance.
        """

        if self.request and "lat" in self.request.query_params and "long" in self.request.query_params:
            lat = float(self.request.query_params.get("lat"))
            long = float(self.request.query_params.get("long"))

            # Filter properties within the specified distance
            properties_within_given_distance = [
                property.id
                for property in queryset.filter(building__latitude__isnull=False, building__longitude__isnull=False)
                # Calculate and get properties within the specified distance by geodesic (geopy package)
                if geodesic((lat, long), (property.building.latitude, property.building.longitude)).miles <= value
            ]

            return queryset.filter(id__in=properties_within_given_distance)

        return queryset
