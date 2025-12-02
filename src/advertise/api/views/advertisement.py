import ast
from itertools import combinations
from collections import OrderedDict
from rest_framework.decorators import action
from rest_framework import viewsets, status
from rest_framework.response import Response
from django.db.models import Case, When, Value, IntegerField
from datetime import timedelta
from django.utils import timezone

from advertise.models import Advertisement
from django.contrib.contenttypes.models import ContentType
from django.db.models import Q
from property.models import Property
from building.models import Building
from advertise.api.serializers import AdAnalyticsSerializer, AdvertisementSerializer, AdvertisementSuggestionSerializer
from advertise.api.pagination import AdvertisementPagination
from advertise.api.permissions import AdvertisementPermission


class AdvertisementViewSet(viewsets.ModelViewSet):
    serializer_class = AdvertisementSerializer
    pagination_class = AdvertisementPagination
    permission_classes = [AdvertisementPermission]
    queryset = Advertisement.objects.filter(expired_at__gte=timezone.now())
    ordering = ["position", "-created_at"]  # Default ordering
    
    @action(detail=True, methods=["patch"], url_path="manage-view-time")
    def manage_advertisement_view_time(self, request, pk=None):
        """Updates Ad total view time"""
        ad_obj = self.get_object()
        time_spent = request.data.get("time_spent", None)
        
        if time_spent:
            try:
                # Convert to float and validate
                time_spent_seconds = float(time_spent)
                if time_spent_seconds > 0:
                    ad_obj.view_time += timedelta(seconds=time_spent_seconds)
                    ad_obj.save()
            except (ValueError, TypeError) as e:
                return Response(
                    {"error": f"Invalid time_spent value: {e}"}, 
                    status=status.HTTP_400_BAD_REQUEST
                )
        
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
        """Returns agent/developer advertisement list.
        Previously filtered by property__created_by. Now we must derive this through the generic relation.
        We'll include only advertisements whose content_object (if it's a Property) was created by the user.
        Other content types (e.g., Building) are included only if they expose a created_by attribute matching the user.
        """

        user = request.user
        # Collect IDs for Property & Building content the user owns
        property_ct = ContentType.objects.get_for_model(Property)
        building_ct = ContentType.objects.get_for_model(Building)
        property_ids = list(Property.objects.filter(created_by=user).values_list("id", flat=True))
        building_ids = list(Building.objects.filter(created_by=user).values_list("id", flat=True))

        # Filter advertisements for owned Property or Building objects
        advertisement_qs = self.get_queryset().filter(
            Q(content_type=property_ct, object_id__in=property_ids) |
            Q(content_type=building_ct, object_id__in=building_ids)
        )
        serializer = self.serializer_class(advertisement_qs, many=True)
        return Response(serializer.data, status=status.HTTP_200_OK)


    @action(detail=False, methods=["get"], url_path="suggested")
    def suggested_advertisement(self, request):
        """Suggest advertisements for both Property & Building targets.
        Strategy:
          1. Build ordered list of candidate Property IDs using cookie filters & place combinations.
          2. Build ordered list of candidate Building IDs using mapped place filters.
          3. Merge and fetch Advertisement objects (generic relation) preserving relative order.
        """
        property_qs = Property.objects.all().select_related("building")
        building_qs = Building.objects.all()

        def parse_cookie_value(value):
            try:
                return ast.literal_eval(value)
            except Exception:
                return value

        building__type = parse_cookie_value(request.COOKIES.get("building__type"))
        building__sub_type = parse_cookie_value(request.COOKIES.get("building__sub_type"))
        min_price = parse_cookie_value(request.COOKIES.get("min_price"))
        max_price = parse_cookie_value(request.COOKIES.get("max_price"))
        min_number_of_bedroom = parse_cookie_value(request.COOKIES.get("min_number_of_bedroom"))
        max_number_of_bedroom = parse_cookie_value(request.COOKIES.get("max_number_of_bedroom"))
        searched_places = parse_cookie_value(request.COOKIES.get("searched_places"))

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
        query_params = {k: v for k, v in query_params.items() if v is not None}

        query_param_combinations = []
        for i in range(len(query_params), 0, -1):
            query_param_combinations.extend(combinations(query_params.items(), i))

        unique_property_ids = []

        def add_property_ids(filters):
            for prop_id in property_qs.filter(**filters).values_list("id", flat=True):
                if prop_id not in unique_property_ids:
                    unique_property_ids.append(prop_id)

        if searched_places:
            for place in searched_places:
                if query_param_combinations:
                    for combo in query_param_combinations:
                        combo_filters = dict(combo)
                        merged = {**place, **combo_filters}
                        add_property_ids(merged)
                add_property_ids(place)
                # Less granular
                for key in ["building__sub_district", "building__district"]:
                    if key in place:
                        reduced = dict(place)
                        reduced.pop(key)
                        if query_param_combinations:
                            for combo in query_param_combinations:
                                combo_filters = dict(combo)
                                merged = {**reduced, **combo_filters}
                                add_property_ids(merged)
                        add_property_ids(reduced)

        if unique_property_ids:
            rest_props = property_qs.exclude(id__in=unique_property_ids).order_by("-created_at").values_list("id", flat=True)
            property_id_list = unique_property_ids + list(rest_props)
        else:
            property_id_list = list(property_qs.order_by("-created_at").values_list("id", flat=True))

        matched_building_ids = []

        def add_building_ids(filters):
            for bid in building_qs.filter(**filters).values_list("id", flat=True):
                if bid not in matched_building_ids:
                    matched_building_ids.append(bid)

        if searched_places:
            for place in searched_places:
                mapped = {k.replace("building__", ""): v for k, v in place.items() if k.startswith("building__")}
                if building__type is not None:
                    mapped.setdefault("type", building__type)
                if building__sub_type is not None:
                    mapped.setdefault("sub_type", building__sub_type)
                if mapped:
                    add_building_ids(mapped)
                for key in ["sub_district", "district"]:
                    if key in mapped:
                        reduced = dict(mapped)
                        reduced.pop(key)
                        if reduced:
                            add_building_ids(reduced)

        if matched_building_ids:
            rest_buildings = building_qs.exclude(id__in=matched_building_ids).order_by("-created_at").values_list("id", flat=True)
            building_id_list = matched_building_ids + list(rest_buildings)
        else:
            building_id_list = list(building_qs.order_by("-created_at").values_list("id", flat=True))

        property_ct = ContentType.objects.get_for_model(Property)
        building_ct = ContentType.objects.get_for_model(Building)

        ad_location = request.GET.get("ad-location")

        # Build the queryset: include valid generic targets and also ads with null content_type for this location
        valid_targets = (
            Q(content_type=property_ct, object_id__in=property_id_list) |
            Q(content_type=building_ct, object_id__in=building_id_list)
        )
        null_targets = Q(content_type__isnull=True)
        if ad_location:
            valid_targets &= Q(ad_location=ad_location)
            null_targets &= Q(ad_location=ad_location)

        ads_qs = self.get_queryset().filter(valid_targets | null_targets)
                
        ordering_cases = []
        pos = 0
        for pid in property_id_list:
            ordering_cases.append(When(content_type=property_ct, object_id=pid, then=pos)); pos += 1
        for bid in building_id_list:
            ordering_cases.append(When(content_type=building_ct, object_id=bid, then=pos)); pos += 1
            
        # Anything unmatched (including content_type is null) will go to the end
        ordering_expression = Case(*ordering_cases, default=Value(10**9), output_field=IntegerField()) if ordering_cases else "position"
        advertisement_qs = ads_qs.order_by("position", ordering_expression, "-created_at")
        serializer = AdvertisementSuggestionSerializer(advertisement_qs, many=True)
        return Response(serializer.data)
