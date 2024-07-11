import ast
from itertools import combinations
from collections import OrderedDict
from rest_framework import viewsets, status
from rest_framework.response import Response
from rest_framework.decorators import action
from django.shortcuts import get_object_or_404
from django.db.models import Case, When
from advertise.models import Reel
from property.models import Property
from advertise.api.serializers import ReelSerializer, ActiveReelSerializer
from advertise.api.permissions import ReelPermission
from advertise.api.pagination import ReelPagination


class ReelViewSet(viewsets.ModelViewSet):
    serializer_class = ReelSerializer
    permission_classes = [ReelPermission]
    pagination_class = ReelPagination
    queryset = Reel.objects.all()
    ordering = ["-created_at"]  # Default ordering

    def list(self, request):
        # Returns Agent/Developer Reels
        queryset = self.get_queryset().filter(created_by=request.user).order_by("-created_at")
        serializer = self.serializer_class(queryset, many=True)
        return Response(serializer.data)

    def retrieve(self, request, pk=None):
        reel_obj = get_object_or_404(self.get_queryset(), pk=pk)
        serializer = self.serializer_class(reel_obj)
        if reel_obj.status == "active":
            return Response(serializer.data)
        
        if request.user.is_authenticated and reel_obj.created_by == request.user:
            return Response(serializer.data)
        
        return Response({"detail": "Not found."}, status=status.HTTP_404_NOT_FOUND)

    @action(detail=False, methods=["get"], url_path="active")
    def active_reels(self, request):
        # Returns active reels and filter reels if category provides

        category = request.query_params.get("category", None)
        query_params = {}   # Query parameter will append here
        if category:
            query_params.update({"category": category})

        active_reels = self.get_queryset().filter(**query_params, status="active").order_by("-created_at")
        paginator = self.pagination_class()
        paginated_queryset = paginator.paginate_queryset(active_reels, request)
        serializer = ActiveReelSerializer(paginated_queryset, many=True)
        return paginator.get_paginated_response(serializer.data)
    

    @action(detail=False, methods=["get"], url_path="suggested")
    def suggested_reels(self, request):
        property_qs = Property.objects.all().select_related("building")
        
        # Helper function to parse the cookie values
        def parse_cookie_value(value):
            try:
                return ast.literal_eval(value)
            except (ValueError, SyntaxError):
                return value

        # Extract cookie values
        building__type = parse_cookie_value(request.COOKIES.get("building__type"))
        building__sub_type = parse_cookie_value(request.COOKIES.get("building__sub_type"))
        min_price = parse_cookie_value(request.COOKIES.get("min_price"))
        max_price = parse_cookie_value(request.COOKIES.get("max_price"))
        min_number_of_bedroom = parse_cookie_value(request.COOKIES.get("min_number_of_bedroom"))
        max_number_of_bedroom = parse_cookie_value(request.COOKIES.get("max_number_of_bedroom"))
        
        searched_places = request.COOKIES.get("searched_places")
        if searched_places:
            searched_places = ast.literal_eval(searched_places)

        # Create initial query parameters dictionary
        query_params = {
            "building__type": building__type,
            "building__sub_type__in": building__sub_type,
            "price__gte": min_price,
            "price__lte": max_price,
            "number_of_bedroom__gte": min_number_of_bedroom,
            "number_of_bedroom__lte": max_number_of_bedroom,
        }

        # Filter out None values
        query_params = {k: v for k, v in query_params.items() if v is not None}

        # Get all possible combinations of query parameters in descending order of their length
        query_param_combinations = []
        for i in range(len(query_params), 0, -1):
            query_param_combinations.extend(combinations(query_params.items(), i))

        unique_property_ids = OrderedDict()  # Defined in the outer scope

        # Function to add property IDs to unique_property_ids
        def filter_and_add_ids(filters):
            nonlocal unique_property_ids  # Allows modification of the unique_property_ids variable defined in the enclosing scope
            property_sub_qs = property_qs.filter(**filters)
            for prop_id in property_sub_qs.values_list("id", flat=True):
                unique_property_ids[prop_id] = None  # Add each property ID to unique_property_ids
                # Using OrderedDict to preserve the insertion order and ensure IDs are unique

        # Process each searched place with each combination of query parameters
        if searched_places:
            for place in searched_places:
                for combo in query_param_combinations:
                    filters = dict(combo)  # Convert the combination tuple to a dictionary
                    filters.update(place)  # Add place-specific filters
                    filter_and_add_ids(filters)  # Filter properties and add their IDs to unique_property_ids

                # Also handle place alone after removing specific levels of granularity
                for key in ["building__sub_district", "building__district"]:
                    if key in place:
                        place_copy = place.copy()  # Make a copy of the place dictionary
                        place_copy.pop(key)  # Remove the specified key to create a less granular filter

                        for combo in query_param_combinations:
                            filters = dict(combo)  # Convert the combination tuple to a dictionary
                            filters.update(place_copy)  # Add the less granular place-specific filters
                            filter_and_add_ids(filters)  # Filter properties and add their IDs to unique_property_ids

        # Convert OrderedDict keys to list to get unique property IDs in the original order
        unique_property_ids = list(unique_property_ids.keys())
        # Get the queryset of the rest of the properties excluding the ones in unique_property_ids
        rest_of_the_property_qs = property_qs.exclude(id__in=unique_property_ids).order_by("-created_at").values_list("id", flat=True)        
        # Combine the unique property IDs with the rest, maintaining the original order first
        property_ids = unique_property_ids + list(rest_of_the_property_qs)
       
        # Create a Case expression to order the properties based on their IDs
        order = Case(*[When(property__id=id, then=pos) for pos, id in enumerate(property_ids)])
        # Filter the queryset for active reels and order them according to the Case expression
        reels_qs = self.get_queryset().filter(property_id__in=property_ids, status="active").order_by(order)
        paginator = self.pagination_class()
        paginated_queryset = paginator.paginate_queryset(reels_qs, request)
        serializer = self.serializer_class(paginated_queryset, many=True)

        return paginator.get_paginated_response(serializer.data)
