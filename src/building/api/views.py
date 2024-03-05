from django.db.models import OuterRef, Subquery, Value, F, CharField, When, Case, BooleanField, Avg, Count
from django.db.models.functions import Concat
from rest_framework import viewsets, status
from rest_framework.decorators import action
from rest_framework.response import Response
from building.api.permissions import BuildingPermission, BuildingReviewPermission
from building.api.serializers import (
    BuildingSerializer,
    BuildingListSerializer,
    BuildingDetailsSerializer,
    BuildingCreateAndUpdateSerializer,
    BuildingMediaSerializer,
    BuildingReviewSerializer,
    BuildingVariousFeatureSerializer,
)
from building.api.filters import BuildingFilter
from building.models import Building, BuildingMedia, BuildingReview
from property.models import Property, PropertyMedia
from property.api.serializers import PropertyAvailableUnitsSerializer
from utils.general_func import get_chatgpt_response


class BuildingViewSet(viewsets.ModelViewSet):
    queryset = Building.objects.select_related("created_by").prefetch_related("media_files", "populars")
    serializer_class = BuildingSerializer
    permission_classes = [BuildingPermission]
    filterset_class = BuildingFilter
    ordering = ["-created_at"]  # Default ordering

    def get_queryset(self):
        queryset = self.queryset

        if self.action in ["popular"]:
            queryset = queryset.annotate(
                default_image_url=Subquery(
                    BuildingMedia.objects.filter(building=OuterRef("pk"), type="image")
                    .annotate(full_file_url=Concat(Value("/media/"), F("file"), output_field=CharField()))
                    .values("full_file_url")[:1]
                )
            )

        return queryset

    def get_serializer_class(self):
        serializer = self.serializer_class

        if self.action == "list":  # For list
            serializer = BuildingListSerializer
        elif self.action == "retrieve":  # For details
            serializer = BuildingDetailsSerializer
        elif self.action in ["create", "update", "partial_update"]:  # For create/update
            serializer = BuildingCreateAndUpdateSerializer

        return serializer  # Return default serializer class

    def get_serializer_context(self):
        context = super().get_serializer_context()
        context.update(
            {
                "request": self.request,
            }
        )
        return context

    @action(detail=True, methods=["get"])
    def media_files(self, request, pk=None):
        building = self.get_object()
        media_type = request.query_params.get("media_type")
        media_files = building.media_files.all()

        if media_type:
            media_files = media_files.filter(type=media_type)

            paginated_queryset = self.paginate_queryset(media_files)
            if paginated_queryset is not None:
                serializer = BuildingMediaSerializer(paginated_queryset, many=True)
                return self.get_paginated_response(serializer.data)

            serializer = BuildingMediaSerializer(media_files, many=True)

            return Response(serializer.data, status=status.HTTP_200_OK)
        else:
            return Response({"detail": "Media type is required."}, status=status.HTTP_400_BAD_REQUEST)

    @action(detail=True, methods=["get"])
    def available_units(self, request, pk=None):
        building = self.get_object()

        properties = Property.objects.filter(building=building, is_active=True).annotate(
            default_image_url=Subquery(
                PropertyMedia.objects.filter(property=OuterRef("pk"), type="image")
                .annotate(full_file_url=Concat(Value("/media/"), F("file"), output_field=CharField()))
                .values("full_file_url")[:1]
            )
        )

        property_id = request.query_params.get("property_id")
        if property_id:
            properties = properties.exclude(id=property_id)

        bed = request.query_params.get("bed")
        if bed:
            properties = properties.filter(number_of_bedroom=bed)

        paginated_queryset = self.paginate_queryset(properties)
        if paginated_queryset is not None:
            serializer = PropertyAvailableUnitsSerializer(paginated_queryset, many=True)
            return self.get_paginated_response(serializer.data)

        serializer = PropertyAvailableUnitsSerializer(properties, many=True)

        return Response(serializer.data, status=status.HTTP_200_OK)

    @action(detail=False, methods=["get"])
    def popular(self, request):
        """
        Retrieve a list of popular buildings with pagination.
        """
        queryset = self.get_queryset().filter(populars__isnull=False)
        page = self.paginate_queryset(queryset)

        if page is not None:
            serializer = BuildingVariousFeatureSerializer(page, many=True)
            return self.get_paginated_response(serializer.data)

        serializer = BuildingVariousFeatureSerializer(queryset, many=True)
        return Response(serializer.data, status=status.HTTP_200_OK)

    @action(detail=False, methods=["post"])
    def generate_description(self, request):
        """
        Return an automated professional building description with ChatGPT
        """
        building_info = request.data

        content = f"building_info: {building_info} \n\n \
            Give me a professional description of the building depending on above the building_info."

        generated_building_description = get_chatgpt_response(content)

        return Response({"generated_building_description": generated_building_description}, status=status.HTTP_200_OK)


class BuildingReviewViewSet(viewsets.ModelViewSet):
    serializer_class = BuildingReviewSerializer
    permission_classes = [BuildingReviewPermission]
    serializer_method_fields = ["POST"]

    def get_queryset(self):
        building_id = self.request.GET.get("building_id") or self.request.data.get("building_id")
        if not building_id:
            return BuildingReview.objects.none()
        return BuildingReview.objects.filter(building_id=building_id)

    def get_serializer_context(self):
        context = super().get_serializer_context()
        context["request"] = self.request
        return context
