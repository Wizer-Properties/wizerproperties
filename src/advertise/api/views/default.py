import ast
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
        searched_places = request.COOKIES.get("searched_places")
        building__type = request.COOKIES.get("building__type")
        building__sub_type = request.COOKIES.get("building__sub_type")
        min_price = request.COOKIES.get("min_price")
        max_price = request.COOKIES.get("max_price")
        min_number_of_bedroom = request.COOKIES.get("min_number_of_bedroom")
        max_number_of_bedroom = request.COOKIES.get("max_number_of_bedroom")
        
        if searched_places:
            searched_places = ast.literal_eval(searched_places)

        qurey_perams = {}
        if building__type:
            building__type = ast.literal_eval(building__type)
            qurey_perams.update({"building__type": building__type})
        if building__sub_type:
            building__sub_type = ast.literal_eval(building__sub_type)
            qurey_perams.update({"building__sub_type__in": building__sub_type})
        if min_price:
            min_price = ast.literal_eval(min_price)
            qurey_perams.update({"price__gte": min_price})
        if max_price:
            max_price = ast.literal_eval(max_price)
            qurey_perams.update({"price__lte": max_price})
        if min_number_of_bedroom:
            min_number_of_bedroom = ast.literal_eval(min_number_of_bedroom)
            qurey_perams.update({"number_of_bedroom__gte": min_number_of_bedroom})
        if max_number_of_bedroom:
            max_number_of_bedroom = ast.literal_eval(max_number_of_bedroom)
            qurey_perams.update({"number_of_bedroom__lte": max_number_of_bedroom})

        unique_property_ids = OrderedDict()  # Defined in the outer scope

        def filter_and_add_ids(filters):
            nonlocal unique_property_ids  # Refers to the unique_property_ids in the outer scope
            property_sub_qs = property_qs.filter(**filters)  # Apply filters to the property queryset
            for prop_id in property_sub_qs.values_list("id", flat=True):  # Iterate through the filtered property IDs
                unique_property_ids[prop_id] = None  # Add each property ID to unique_property_ids

        # The outer function continues...
        if searched_places:
            for place in searched_places:
                current_place = place.copy()
                
                if qurey_perams:
                    filter_and_add_ids({**qurey_perams, **current_place})
                filter_and_add_ids(current_place)

                if "building__sub_district" in current_place:
                    current_place.pop("building__sub_district")
                    if qurey_perams:
                        filter_and_add_ids({**qurey_perams, **current_place})
                    filter_and_add_ids(current_place)

                if "building__district" in current_place:
                    current_place.pop("building__district")
                    if qurey_perams:
                        filter_and_add_ids({**qurey_perams, **current_place})
                    filter_and_add_ids(current_place)

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
