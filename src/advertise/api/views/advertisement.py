import ast
from itertools import combinations
from collections import OrderedDict
from rest_framework.decorators import action
from rest_framework import viewsets, status
from rest_framework.response import Response
from django.db.models import Case, When
from datetime import timedelta

from advertise.models import Advertisement
from property.models import Property
from advertise.api.serializers import AdAnalyticsSerializer, AdvertisementSerializer
from advertise.api.pagination import AdvertisementPagination
from advertise.api.permissions import AdvertisementPermission


class AdvertisementViewSet(viewsets.ModelViewSet):
    serializer_class = AdvertisementSerializer
    pagination_class = AdvertisementPagination
    permission_classes = [AdvertisementPermission]
    queryset = Advertisement.objects.all()
    ordering = ["-created_at"]  # Default ordering
    
    @action(detail=True, methods=["patch"], url_path="manage-view-time")
    def manage_advertisement_view_time(self, request, pk=None):
        # Updates Ad total view time
        ad_obj = self.get_object()
        time_spent = request.data.get("time_spent", None)
        if time_spent:
            time_spent = time_spent / 1000  # Converting milliseconds into seconds
            ad_obj.view_time += timedelta(seconds=time_spent)
            ad_obj.save()
        serializer = self.serializer_class(ad_obj)
        
        return Response(serializer.data, status=status.HTTP_200_OK)


    @action(detail=True, methods=["get"], url_path="analytics")
    def advertisement_analytics(self, request, pk=None):
        """Returns analytics of an advertisement"""

        ad_obj = self.get_object()
        serializer = AdAnalyticsSerializer(ad_obj)
        return Response(serializer.data, status=status.HTTP_200_OK)


    @action(detail=False, methods=["get"], url_path="list")
    def advertisement_list(self, request):
        """Returns agent/developer advertisement list"""
        
        advertisement_qs = self.get_queryset().filter(property__created_by=request.user)
        paginator = self.pagination_class()
        paginated_queryset = paginator.paginate_queryset(advertisement_qs, request)
        serializer = self.serializer_class(paginated_queryset, many=True)
        return paginator.get_paginated_response(serializer.data)


    @action(detail=False, methods=["get"], url_path="suggested")
    def suggested_advertisement(self, request):
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
        searched_places = parse_cookie_value(request.COOKIES.get("searched_places"))

        # Create initial query parameters dictionary
        query_params = {}
        if building__type is not None:
            query_params["building__type"] = building__type
        if building__sub_type is not None:
            query_params["building__sub_type__in"] = building__sub_type
        if min_price is not None:
            query_params["price__gte"] = min_price
        if max_price is not None:
            query_params["price__lte"] = max_price
        if min_number_of_bedroom is not None:
            query_params["number_of_bedroom__gte"] = min_number_of_bedroom
        if max_number_of_bedroom is not None:
            query_params["number_of_bedroom__lte"] = max_number_of_bedroom

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
                if query_param_combinations:
                    for combo in query_param_combinations:
                        filters = dict(combo)  # Convert the combination tuple to a dictionary
                        filter_and_add_ids({**place, **filters})  # Filter properties and add their IDs to unique_property_ids
                
                filter_and_add_ids(place)  # Filter properties and add their IDs to unique_property_ids

                # Also handle place alone after removing specific levels of granularity
                for key in ["building__sub_district", "building__district"]:
                    if key in place:
                        place.pop(key)  # Remove the specified key to create a less granular filter

                        if query_param_combinations:
                            for combo in query_param_combinations:
                                filters = dict(combo)  # Convert the combination tuple to a dictionary
                                filter_and_add_ids({**place, **filters})  # Filter properties and add their IDs to unique_property_ids
                        
                        filter_and_add_ids(place)  # Filter properties and add their IDs to unique_property_ids

        # Convert OrderedDict keys to list to get unique property IDs in the original order
        unique_property_ids = list(unique_property_ids.keys())

        if unique_property_ids:
            # Get the queryset of the rest of the properties excluding the ones in unique_property_ids
            rest_of_the_property_ids = property_qs.exclude(id__in=unique_property_ids).order_by("-created_at").values_list("id", flat=True)        
            # Combine the unique property IDs with the rest, maintaining the original order first
            property_id_list = unique_property_ids + list(rest_of_the_property_ids)
            # Create a Case expression to order the properties based on their IDs
            order_by = Case(*[When(property__id=id, then=pos) for pos, id in enumerate(property_id_list)])
        else:
            property_ids = property_qs.order_by("-created_at").values_list("id", flat=True)
            property_id_list = list(property_ids)
            # If their is no cookie we will order them by position
            order_by = "position"
        
        ad_query_params = {
            "property_id__in": property_id_list,
        }
        ad_location = request.GET.get("ad-location", None)
        if ad_location:
            ad_query_params["ad_location"] = ad_location
       
        # Filter the queryset for active reels and order them according to the Case expression
        advertisement_qs = self.get_queryset().filter(**ad_query_params).order_by(order_by)
        paginator = self.pagination_class()
        paginated_queryset = paginator.paginate_queryset(advertisement_qs, request)
        serializer = self.serializer_class(paginated_queryset, many=True)
        return Response(serializer.data)
