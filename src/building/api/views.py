from django.db.models import OuterRef, Subquery, Value, F, CharField, When, Case, BooleanField, Avg
from django.db.models.functions import Concat
from rest_framework import viewsets, status
from rest_framework.decorators import action
from rest_framework.response import Response
from building.api.permissions import BuildingPermission, BuildingReviewPermission
from building.api.serializers import BuildingSerializer, BuildingMediaSerializer, BuildingReviewSerializer
from building.api.filters import BuildingFilter
from building.models import Building, BuildingMedia, BuildingReview
from property.models import Property, PropertyMedia
from property.api.serializers import PropertyAvailableUnitsSerializer


class BuildingViewSet(viewsets.ModelViewSet):
    serializer_class = BuildingSerializer
    permission_classes = [BuildingPermission]
    filterset_class = BuildingFilter
    ordering = ["-created_at"]  # Default ordering

    def get_queryset(self):
        user = self.request.user

        queryset = Building.objects.annotate(
            default_image_url=Subquery(
                BuildingMedia.objects.filter(building=OuterRef("pk"), type="image")
                .annotate(full_file_url=Concat(Value("/media/"), F("file"), output_field=CharField()))
                .values("full_file_url")[:1]
            )
        )

        if self.request.method == "GET":
            queryset = queryset.annotate(
                # Annotate is_reviewed based on whether the building is in the user's review list
                is_reviewed=Case(
                    When(buildingreview__user=user, then=Value(True)),
                    default=Value(False),
                    output_field=BooleanField(),
                )
                if user.is_authenticated and hasattr(user, "prospectprofile")
                # If the user is not authenticated and prospect, set is_reviewed to False for all building
                else Value(False, output_field=BooleanField()),
                average_rating=Avg("buildingreview__rating"),
            )
        return queryset

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
