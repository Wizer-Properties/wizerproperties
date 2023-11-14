from django.db.models import OuterRef, Subquery, Value, F, CharField, When, Case, BooleanField
from django.db.models.functions import Concat
from rest_framework import viewsets, status, permissions
from rest_framework.decorators import action
from rest_framework.response import Response
from .permissions import PropertyPermission, ComparePropertyPermission, ProspectPropertyFavoritePermission
from .serializers import (
    PropertySerializer,
    PropertyMediaSerializer,
    ComparePropertySerializer,
    ProspectFavoritePropertySerializer,
)
from .filters import PropertyFilter
from building.api.serializers import BuildingMediaSerializer
from property.models import Property, PropertyMedia, CompareProperty, ProspectFavoriteProperty


class PropertyViewSet(viewsets.ModelViewSet):
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
        if self.request.method in ["POST", "PATCH", "PUT"]:
            return Property.objects.all()

        user = self.request.user

        queryset = Property.objects.filter(is_active=True).annotate(
            # Annotate default_image_url with the URL of the first image for each property (if available)
            default_image_url=Subquery(
                PropertyMedia.objects.filter(property=OuterRef("pk"), type="image")
                .annotate(full_file_url=Concat(Value("/media/"), F("file"), output_field=CharField()))
                .values("full_file_url")[:1]
            ),
            # Annotate is_compared based on whether the property is in the user's comparison list
            is_compared=Case(
                When(compareproperty__user=user, then=Value(True)),
                default=Value(False),
                output_field=BooleanField(),
            )
            if user.is_authenticated
            # If the user is not authenticated, set is_compared to False for all properties
            else Value(False, output_field=BooleanField()),
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

    def _get_paginated_media_files(self, media_files, serializer_class):
        paginated_queryset = self.paginate_queryset(media_files)
        if paginated_queryset is not None:
            serializer = serializer_class(paginated_queryset, many=True)
            return self.get_paginated_response(serializer.data)
        serializer = serializer_class(media_files, many=True)
        return Response(serializer.data, status=status.HTTP_200_OK)

    @action(detail=True, methods=["get"])
    def media_files(self, request, pk=None):
        property = self.get_object()
        media_type = request.query_params.get("type")
        building_media_files = property.building.media_files.all()
        property_media_files = property.media_files.all()

        if media_type:
            if media_type in ["image", "video"]:
                media_files = property_media_files.filter(type=media_type)
                serializer_class = PropertyMediaSerializer
            else:
                media_files = building_media_files.filter(type=media_type)
                serializer_class = BuildingMediaSerializer

            return self._get_paginated_media_files(media_files, serializer_class)
        else:
            return Response({"detail": "Media type is required."}, status=status.HTTP_400_BAD_REQUEST)


class ComparePropertyViewSet(viewsets.ModelViewSet):
    serializer_class = ComparePropertySerializer
    permission_classes = [ComparePropertyPermission]

    def get_queryset(self):
        return CompareProperty.objects.filter(user=self.request.user)

    def get_serializer_context(self):
        # Get the default context from the parent class
        context = super(ComparePropertyViewSet, self).get_serializer_context()
        context.update(
            {
                "request": self.request,
            }
        )
        return context

    def perform_create(self, serializer):
        serializer.save(user=self.request.user)


class ProspectFavoritePropertyViewSet(viewsets.ModelViewSet):
    serializer_class = ProspectFavoritePropertySerializer
    permission_classes = [permissions.IsAuthenticated, ProspectPropertyFavoritePermission]
    serializer_method_fields = ["POST", "GET", "DELETE"]

    def get_queryset(self):
        return ProspectFavoriteProperty.objects.select_related("prospect", "property").filter(
            prospect=self.request.user.prospectprofile
        )

    def get_serializer_context(self):
        # Get the default context from the parent class
        context = super(ProspectFavoritePropertyViewSet, self).get_serializer_context()

        # Add custom data to the context
        context["request"] = self.request

        return context
