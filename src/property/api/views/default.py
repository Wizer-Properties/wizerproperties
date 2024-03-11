from django.utils import timezone
from django.db.models import OuterRef, Subquery, Value, F, CharField, Exists, BooleanField
from django.db.models.functions import Concat
from rest_framework import viewsets, status
from rest_framework.decorators import action
from rest_framework.response import Response
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
)
from property.api.filters import PropertyFilter
from building.api.serializers import BuildingInfoForPropertySerializer, BuildingMediaSerializer
from building.models import Building, BuildingMedia
from property.models import Property, PropertyMedia, CompareProperty, ProspectFavoriteProperty
from user.api.serializers import AgentProfileSerializer, DeveloperProfileSerializer
from utils.general_func import get_chatgpt_response


class PropertyViewSet(viewsets.ModelViewSet):
    queryset = Property.objects.select_related("building", "created_by").prefetch_related(
        "media_files", "discounts", "newly_createds", "populars"
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
    ordering = ["-created_at"]  # Default ordering

    def get_queryset(self):
        queryset = self.queryset
        user = self.request.user

        if self.action in ["list", "retrieve", "available_units", "discount", "newly_created", "popular"]:
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
        queryset = self.get_queryset().filter(populars__isnull=False)

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
