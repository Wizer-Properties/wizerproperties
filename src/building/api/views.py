from django.db.models import OuterRef, Subquery, Value, F, CharField
from django.db.models.functions import Concat
from rest_framework import viewsets, status
from rest_framework.decorators import action
from rest_framework.response import Response
from .permissions import BuildingPermission
from .serializers import BuildingSerializer, BuildingMediaSerializer
from building.models import Building, BuildingMedia
from property.models import Property, PropertyMedia
from property.api.serializers import PropertyAvailableUnitsSerializer
from utils.custom.pagination import CustomPagination


class BuildingViewSet(viewsets.ModelViewSet):
    serializer_class = BuildingSerializer
    permission_classes = [BuildingPermission]

    def get_queryset(self):
        queryset = Building.objects.annotate(
            default_image_url=Subquery(
                BuildingMedia.objects.filter(building=OuterRef("pk"), type="image")
                .annotate(full_file_url=Concat(Value("/media/"), F("file"), output_field=CharField()))
                .values("full_file_url")[:1]
            )
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
        media_type = request.query_params.get("type")
        media_files = building.media_files.all()

        if media_type:
            media_files = media_files.filter(type=media_type)
            serializer = BuildingMediaSerializer(media_files, many=True)
        else:
            return Response({"detail": "Media type is required."}, status=status.HTTP_400_BAD_REQUEST)

        return Response(serializer.data, status=status.HTTP_200_OK)

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

        paginator = CustomPagination()
        paginated_queryset = paginator.paginate_queryset(properties, request)
        if paginated_queryset is not None:
            serializer = PropertyAvailableUnitsSerializer(paginated_queryset, many=True)
            return paginator.get_paginated_response(serializer.data)

        serializer = PropertyAvailableUnitsSerializer(properties, many=True)

        return Response(serializer.data, status=status.HTTP_200_OK)
