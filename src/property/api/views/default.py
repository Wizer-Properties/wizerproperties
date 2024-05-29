from geopy.distance import geodesic
from django.utils import timezone
from geopy.distance import geodesic
from django.db.models import OuterRef, Subquery, Value, F, CharField, Exists, BooleanField, Count
from django.db.models.functions import Concat
from rest_framework import viewsets, status
from rest_framework.decorators import action
from rest_framework.response import Response
from rest_framework.decorators import api_view
from property.api.permissions import PropertyPermission
from property.api.serializers import (
    PropertySerializer,
    PropertyListSerializer,
    PropertyDetailsSerializer,
    PropertyCreateAndUpdateSerializer,
    PropertyMediaSerializer,
    PropertyVariousFeatureSerializer,
    PropertyVariousFeatureMinimalInfoSerializer,
    PropertyFacilitiesSerializer,
    SchedulePropertySerializer,
    PropertySearchMapSerializer,
)
from property.api.filters import PropertyFilter
from property.api.pagination import UserPropertyPagination
from building.api.serializers import BuildingInfoForPropertySerializer, BuildingMediaSerializer
from building.models import Building, BuildingMedia
from property.models import Property, PropertyMedia, CompareProperty, ProspectFavoriteProperty
from user.models import ProspectProfile
from user.api.serializers import AgentProfileSerializer, DeveloperProfileSerializer
from utils.general_func import get_chatgpt_response
from utils.general_data import PRICE_RANGES


class PropertyViewSet(viewsets.ModelViewSet):
    queryset = Property.objects.select_related("building", "created_by").prefetch_related(
        "media_files", "discounts", "newly_createds"
    )

    serializer_class = PropertySerializer
    permission_classes = [PropertyPermission]
    filterset_class = PropertyFilter
    search_fields = [
        "building__address",
        "building__province",
        "building__district",
        "building__sub_district",
    ]
    ordering_fields = ["created_at", "price", "visit_count"]
    ordering = ["-created_at"]  # Default ordering

    def get_queryset(self):
        queryset = self.queryset
        user = self.request.user

        if self.action in ["list", "retrieve", "available_units", "discount", "newly_created", "popular", "nearest"]:
            if self.action not in ["available_units"]:
                queryset = queryset.filter(is_active=True).annotate(
                    # Annotate is_compared based on whether the property is in the user's comparison list
                    is_compared=(
                        Exists(CompareProperty.objects.filter(user=user, property=OuterRef("pk")))
                        if user.is_authenticated and hasattr(user, "prospectprofile")
                        else Value(None, output_field=BooleanField())
                    ),
                    # Annotate is_favorited based on whether the property is in the user's favorite list
                    is_favorited=(
                        Exists(
                            ProspectFavoriteProperty.objects.filter(
                                prospect=user.prospectprofile, property=OuterRef("pk")
                            )
                        )
                        if user.is_authenticated and hasattr(user, "prospectprofile")
                        else Value(None, output_field=BooleanField())
                    ),
                )

            if self.action not in ["list", "retrieve"]:
                queryset = queryset.annotate(
                    # Annotate default_image_url with the URL of the first image for each property (if available)
                    default_image_url=Subquery(
                        PropertyMedia.objects.filter(property=OuterRef("pk"), type="image")
                        .annotate(full_file_url=Concat(Value("/media/"), F("file"), output_field=CharField()))
                        .values("full_file_url")[:1]
                    ),
                )
            if self.action in ["list"]:
                queryset = queryset.annotate(
                    # Annotate default_image_url with the URL of the first image for each property (if available)
                    ariel_video_url=Subquery(
                        BuildingMedia.objects.filter(building=OuterRef("building_id"), type="aerial_drone_video")
                        .annotate(full_file_url=Concat(Value("/media/"), F("file"), output_field=CharField()))
                        .values("full_file_url")[:1]
                    ),
                )

        return queryset

    def filter_queryset(self, queryset):
        queryset = super().filter_queryset(queryset)

        # Retrieve the ordering parameter from the request
        ordering = self.request.query_params.get("ordering", None)

        # If popularity is not explicitly requested in the ordering,
        # then maintain popularity-based ordering as primary
        if ordering:
            queryset = queryset.order_by("-visit_count", ordering)
        else:
            queryset = queryset.order_by("-visit_count")

        return queryset

    def get_serializer_class(self):
        serializer = self.serializer_class

        if self.action == "list":  # For list
            serializer = PropertyListSerializer
        elif self.action == "retrieve":  # For details
            serializer = PropertyDetailsSerializer
        elif self.action in ["create", "update", "partial_update"]:  # For create/update
            serializer = PropertyCreateAndUpdateSerializer

        return serializer  # Return default serializer class

    def get_serializer_context(self):
        context = super().get_serializer_context()
        context.update(
            {
                "request": self.request,
            }
        )
        return context

    def _get_paginated_response(self, queryset, serializer_class, **serializer_context):
        paginated_queryset = self.paginate_queryset(queryset)

        if paginated_queryset is not None:
            serializer = serializer_class(paginated_queryset, many=True, **serializer_context)
            return self.get_paginated_response(serializer.data)

        serializer = serializer_class(queryset, many=True, **serializer_context)
        return Response(serializer.data, status=status.HTTP_200_OK)

    @action(detail=True, methods=["get"])
    def media_files(self, request, pk=None):
        property = self.get_object()
        media_type = request.query_params.get("media_type")
        building_media_files = property.building.media_files.all()
        property_media_files = property.media_files.all()

        if media_type:
            if media_type in ["image", "video"]:
                media_files = property_media_files.filter(type=media_type)
                serializer_class = PropertyMediaSerializer
            else:
                media_files = building_media_files.filter(type=media_type)
                serializer_class = BuildingMediaSerializer

            return self._get_paginated_response(media_files, serializer_class)
        else:
            return Response({"detail": "Media type is required."}, status=status.HTTP_400_BAD_REQUEST)

    @action(detail=True, methods=["get"])
    def developer_info(self, request, pk=None):
        property = self.get_object()

        user = property.created_by  # Get the user who created the property

        # Check if the user is an agent or developer
        if hasattr(user, "agentprofile"):
            profile_data = AgentProfileSerializer(user.agentprofile).data
        elif hasattr(user, "developerprofile"):
            profile_data = DeveloperProfileSerializer(user.developerprofile).data
        else:
            profile_data = {}

        return Response(profile_data, status=status.HTTP_200_OK)

    @action(detail=True, methods=["get"])
    def schedule(self, request, pk=None):
        property = self.get_object()
        serializer = SchedulePropertySerializer(property)
        data = serializer.data

        property_image = property.media_files.filter(type="image").first()
        image_path = ""
        if property_image:
            image_path = property_image.file.url
        data.update({"image_path": image_path})

        return Response(data, status=status.HTTP_200_OK)

    @action(detail=True, methods=["get"])
    def building_info(self, request, pk=None):
        property = self.get_object()

        building = property.building  # Get the property building
        building_data = BuildingInfoForPropertySerializer(building).data

        return Response(building_data, status=status.HTTP_200_OK)

    @action(detail=True, methods=["get"])
    def available_facilities(self, request, pk=None):
        property = self.get_object()
        serializer = PropertyFacilitiesSerializer(property)
        return Response(serializer.data, status=status.HTTP_200_OK)

    @action(detail=False, methods=["get"])
    def newly_created(self, request):
        """
        Retrieve a list of newly created properties with pagination.
        """
        queryset = self.get_queryset().filter(newly_createds__isnull=False)

        serializer_context = {}  # Default empty context

        serializer_class = (
            PropertyVariousFeatureMinimalInfoSerializer
            if request.GET.get("towards") == "search"
            else PropertyVariousFeatureSerializer
        )
        return self._get_paginated_response(queryset, serializer_class, **serializer_context)

    @action(detail=False, methods=["get"])
    def popular(self, request):
        """
        Retrieve a list of popular properties with pagination.
        """
        queryset = self.get_queryset().order_by("-visit_count")[:10]

        serializer_context = {}  # Default empty context

        serializer_class = (
            PropertyVariousFeatureMinimalInfoSerializer
            if request.GET.get("towards") == "search"
            else PropertyVariousFeatureSerializer
        )
        return self._get_paginated_response(queryset, serializer_class, **serializer_context)

    @action(detail=False, methods=["get"])
    def discount(self, request):
        """
        Retrieve a list of discount properties with pagination.
        """
        today = timezone.now().date()
        queryset = self.get_queryset().filter(discounts__period__gte=today)

        serializer_context = {}  # Default empty context
        if request.GET.get("towards") != "search":
            serializer_context["include_discount_period"] = True

        serializer_class = (
            PropertyVariousFeatureMinimalInfoSerializer
            if request.GET.get("towards") == "search"
            else PropertyVariousFeatureSerializer
        )

        return self._get_paginated_response(queryset, serializer_class, **serializer_context)

    @action(detail=False, methods=["post"])
    def generate_description(self, request):
        """
        Return an automated professional property description with ChatGPT
        """
        property_info = request.data

        building_info = {}

        building_id = request.data.get("building_id")
        if building_id:
            building = Building.objects.filter(id=building_id).first()
            if building:
                building_info.update(
                    {
                        "address": building.address,
                        "project_total_area": building.project_total_area,
                        "total_floors": building.total_floors,
                        "construction_year": building.construction_year,
                        "distance_from_location_to_BTS_or_MRT": building.distance_from_location_to_BTS_or_MRT,
                        "distance_from_location_to_ARL": building.distance_from_location_to_ARL,
                    }
                )

        content = f"building_info: {building_info} \n\n property_info: {property_info} \n\n \
                    Give me a professional description of the property depending on above the building_info and property_info. In one building, \
                    there are many properties, meaning this property_info is within the premises of this building_info."

        generated_property_description = get_chatgpt_response(content)

        return Response({"generated_property_description": generated_property_description}, status=status.HTTP_200_OK)

    @action(detail=False, methods=["post"])
    def re_generate_description(self, request):
        """
        Return an automated professional building description with ChatGPT
        """
        content = request.data.get("content", None)
        previous_response = request.data.get("previous_response", None)
        generated_property_description = get_chatgpt_response(content, previous_response)

        return Response(
            {"generated_property_description": generated_property_description}, status=status.HTTP_201_CREATED
        )

    @action(detail=False, methods=["get"])
    def count_in_price_ranges(self, request):
        # Dictionary to store the count of properties for each price range
        price_counts = {}

        properties = Property.objects.all()

        # Variable to keep track of the highest count and range of properties among all ranges
        highest_count = 0
        highest_count_range = None

        for price_range in PRICE_RANGES:
            min_price, max_price = price_range
            count = properties.filter(price__gt=min_price, price__lte=max_price).count()

            # Update price_counts with the count of properties for the current range
            price_counts[f"{max_price}"] = count

            if count > highest_count:
                highest_count = count
                highest_count_range = f"{max_price}"

        response_data = {
            "total_properties": properties.count(),
            "highest_count_range": highest_count_range,
            "highest_count": highest_count,
            "price_counts": price_counts,
        }

        return Response(response_data, status=status.HTTP_200_OK)

    @action(detail=False, methods=["get"])
    def property_list_for_map_search(self, request):
        serializer = PropertySearchMapSerializer(self.filter_queryset(self.get_queryset()), many=True)
        return Response({"results": serializer.data}, status=200)

    @action(detail=True, methods=["get"])
    def nearby_property_list(self, request, pk):
        instance = self.get_object()

        properties_within_given_distance = [
            property.id
            for property in Property.objects.filter(
                building__latitude__isnull=False, building__longitude__isnull=False
            ).exclude(id=instance.id)
            # Calculate and get properties within the specified distance by geodesic (geopy package)
            if geodesic(
                (instance.building.latitude, instance.building.longitude),
                (property.building.latitude, property.building.longitude),
            ).miles
            <= 20
        ]

        qs = Property.objects.filter(id__in=properties_within_given_distance).annotate(
            # Annotate default_image_url with the URL of the first image for each property (if available)
            default_image_url=Subquery(
                PropertyMedia.objects.filter(property=OuterRef("pk"), type="image")
                .annotate(full_file_url=Concat(Value("/media/"), F("file"), output_field=CharField()))
                .values("full_file_url")[:1]
            ),
            is_compared=Value(False),
            is_favorited=Value(False),
        )
        serializer = PropertySerializer(qs, many=True)

        return Response({"results": serializer.data}, status=200)

    def nearest(self, request):
        prospect_profile = ProspectProfile.objects.get(user=request.user)

        # Get the prospect's location (latitude, longitude)
        if prospect_profile.latitude is None or prospect_profile.longitude is None:
            return Response({"non_field_errors": ["Prospect location not set"]}, status=status.HTTP_400_BAD_REQUEST)

        prospect_location = (prospect_profile.latitude, prospect_profile.longitude)

        # Calculate the distance of each property from the prospect's location
        properties = self.get_queryset().filter(building__latitude__isnull=False, building__longitude__isnull=False)
        properties_with_distance = []

        for property in properties:
            building_location = (property.building.latitude, property.building.longitude)
            distance = geodesic(prospect_location, building_location).kilometers
            properties_with_distance.append((property, distance))

        # Sort properties by distance
        properties_with_distance.sort(key=lambda x: x[1])

        # Limit to 2 properties per building
        filtered_properties = []
        building_count = {}

        for property, distance in properties_with_distance:
            building_id = property.building_id
            if building_count.get(building_id, 0) < 2:
                property.distance = distance
                filtered_properties.append(property)
                building_count[building_id] = building_count.get(building_id, 0) + 1
            if len(filtered_properties) >= 10:
                break

        # Serialize the properties
        serializer = PropertyVariousFeatureSerializer(filtered_properties, many=True)

        return Response(serializer.data, status=status.HTTP_200_OK)


@api_view(["GET"])
def user_properties(request, user_id):
    properties_qs = (
        Property.objects.filter(building__created_by__id=user_id, is_active=True)
        .annotate(
            # Annotate is_compared based on whether the property is in the user's comparison list
            is_compared=(
                Exists(CompareProperty.objects.filter(user=request.user, property=OuterRef("pk")))
                if request.user.is_authenticated and hasattr(request.user, "prospectprofile")
                else Value(None, output_field=BooleanField())
            ),
            # Annotate is_favorited based on whether the property is in the user's favorite list
            is_favorited=(
                Exists(
                    ProspectFavoriteProperty.objects.filter(
                        prospect=request.user.prospectprofile, property=OuterRef("pk")
                    )
                )
                if request.user.is_authenticated and hasattr(request.user, "prospectprofile")
                else Value(None, output_field=BooleanField())
            ),
            # Annotate default_image_url based on whether the property is in the user's
            default_image_url=Subquery(
                PropertyMedia.objects.filter(property=OuterRef("pk"), type="image")
                .annotate(full_file_url=Concat(Value("/media/"), F("file"), output_field=CharField()))
                .values("full_file_url")[:1]
            ),
        )
        .order_by("-id")
    )

    serializer_class = PropertyVariousFeatureSerializer
    paginator = UserPropertyPagination()
    paginated_queryset = paginator.paginate_queryset(properties_qs, request)

    if paginated_queryset is not None:
        serializer = serializer_class(paginated_queryset, many=True)
        return paginator.get_paginated_response(serializer.data)

    serializer = serializer_class(properties_qs, many=True)
    return Response(serializer.data, status=status.HTTP_200_OK)
