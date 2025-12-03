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
    min_number_of_bedroom = django_filters.NumberFilter(field_name="number_of_bedroom", lookup_expr="gte")
    max_number_of_bedroom = django_filters.NumberFilter(field_name="number_of_bedroom", lookup_expr="lte")
    nearby = django_filters.NumberFilter(method="filter_nearby", label="Nearby (miles)")
    bounds_north = django_filters.NumberFilter(method="filter_bounds")
    bounds_south = django_filters.NumberFilter(method="filter_bounds")
    bounds_east = django_filters.NumberFilter(method="filter_bounds")
    bounds_west = django_filters.NumberFilter(method="filter_bounds")

    class Meta:
        model = Property
        fields = [
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
            "building__id",
            "building__type",
            "building__sub_type",
            "building__quota",
            "building__furnishing",
            "building__status",
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

    def filter_bounds(self, queryset, name, value):
        """
        Filter properties by map bounds (north, south, east, west).
        Only applies filtering if all four bounds parameters are provided.
        """
        if not self.request:
            return queryset

        params = self.request.query_params
        bounds_north = params.get("bounds_north")
        bounds_south = params.get("bounds_south")
        bounds_east = params.get("bounds_east")
        bounds_west = params.get("bounds_west")

        # Only filter if all bounds are provided
        if bounds_north and bounds_south and bounds_east and bounds_west:
            try:
                north = float(bounds_north)
                south = float(bounds_south)
                east = float(bounds_east)
                west = float(bounds_west)

                # Filter properties within the bounds
                # Note: Handle longitude wrapping (east < west when crossing 180/-180)
                if east >= west:
                    # Normal case: bounds don't cross the date line
                    queryset = queryset.filter(
                        building__latitude__gte=south,
                        building__latitude__lte=north,
                        building__longitude__gte=west,
                        building__longitude__lte=east,
                        building__latitude__isnull=False,
                        building__longitude__isnull=False,
                    )
                else:
                    # Bounds cross the date line (east < west)
                    # Split into two queries: west to 180 and -180 to east
                    from django.db.models import Q
                    queryset = queryset.filter(
                        building__latitude__gte=south,
                        building__latitude__lte=north,
                        building__latitude__isnull=False,
                        building__longitude__isnull=False,
                    ).filter(
                        Q(building__longitude__gte=west) | Q(building__longitude__lte=east)
                    )

            except (ValueError, TypeError):
                # If bounds are invalid, return queryset unchanged
                pass

        return queryset
