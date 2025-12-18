from django.db.models import OuterRef, Subquery, Value, F, CharField, Exists, BooleanField
from django.db.models.functions import Concat
from rest_framework import viewsets, status, serializers
from rest_framework.decorators import action
from rest_framework.response import Response
from rest_framework.request import Request
from typing import Any, Dict, List, Optional, Union, cast, TYPE_CHECKING
from building.api.permissions import BuildingPermission
from building.api.serializers import (
    BuildingSerializer,
    BuildingListSerializer,
    BuildingDetailsSerializer,
    BuildingCreateAndUpdateSerializer,
    BuildingMediaSerializer,
    BuildingFacilitiesSerializer,
    ScheduleBuildingSerializer,
    BuildingSearchMapSerializer,
    BuildingInfoSerializerRead
)
from building.api.filters import BuildingFilter
from building.models import Building
from property.models import Property, PropertyMedia, CompareProperty, ProspectFavoriteProperty
from property.api.serializers import PropertyAvailableUnitsSerializer
from user.api.serializers import AgentProfileSerializer, DeveloperProfileSerializer
from utils.general_func import get_chatgpt_response


if TYPE_CHECKING:
    _Base = viewsets.ModelViewSet[Building]
else:
    _Base = viewsets.ModelViewSet


class BuildingViewSet(_Base):
    queryset = Building.objects.select_related("created_by").prefetch_related("media_files")
    serializer_class = BuildingSerializer
    permission_classes = [BuildingPermission]
    filterset_class = BuildingFilter
    ordering = ["-created_at"]  # Default ordering

    def get_serializer_class(self) -> Any:
        serializer = self.serializer_class

        if self.action == "list":  # For list
            serializer = BuildingListSerializer
        elif self.action == "retrieve":  # For details
            serializer = BuildingDetailsSerializer
        elif self.action in ["create", "update", "partial_update"]:  # For create/update
            serializer = BuildingCreateAndUpdateSerializer

        return serializer  # Return default serializer class

    def get_serializer_context(self) -> Dict[str, Any]:
        context: Dict[str, Any] = super().get_serializer_context()
        context.update(
            {
                "request": self.request,
            }
        )
        return context

    @action(detail=True, methods=["get"])
    def media_files(self, request: Request, pk: Optional[str] = None) -> Response:
        building = self.get_object()
        media_type = request.query_params.get("media_type")
        media_files = building.media_files.all()

        if media_type:
            media_files = media_files.filter(type=media_type)

            paginated_queryset = self.paginate_queryset(cast(Any, media_files))
            if paginated_queryset is not None:
                serializer = BuildingMediaSerializer(paginated_queryset, many=True)
                return self.get_paginated_response(serializer.data)

            serializer = BuildingMediaSerializer(media_files, many=True)

            return Response(serializer.data, status=status.HTTP_200_OK)
        else:
            return Response({"detail": "Media type is required."}, status=status.HTTP_400_BAD_REQUEST)

    @action(detail=True, methods=["get"])
    def developer_info(self, request: Request, pk: Optional[str] = None) -> Response:
        building = self.get_object()

        user = building.created_by  # Get the user who created the building

        # Check if the user is an agent or developer
        profile_data: Any = {}
        if user and hasattr(user, "agentprofile"):
            profile_data = AgentProfileSerializer(getattr(user, "agentprofile")).data
        elif user and hasattr(user, "developerprofile"):
            profile_data = DeveloperProfileSerializer(getattr(user, "developerprofile")).data

        return Response(profile_data, status=status.HTTP_200_OK)

    @action(detail=True, methods=["get"])
    def available_facilities(self, request: Request, pk: Optional[str] = None) -> Response:
        building = self.get_object()
        serializer = BuildingFacilitiesSerializer(building)
        return Response(serializer.data, status=status.HTTP_200_OK)

    @action(detail=True, methods=["get"])
    def schedule(self, request: Request, pk: Optional[str] = None) -> Response:
        building = self.get_object()
        serializer = ScheduleBuildingSerializer(building)
        data = serializer.data

        building_image = building.media_files.filter(type="image").first()
        image_path = ""
        if building_image:
            image_path = building_image.file.url
        data.update({"image_path": image_path})

        return Response(data, status=status.HTTP_200_OK)

    @action(detail=True, methods=["get"])
    def available_units(self, request: Request, pk: Optional[str] = None) -> Response:
        building = self.get_object()
        user = self.request.user

        properties = Property.objects.filter(building=building, is_active=True).annotate(
            default_image_url=Subquery(
                PropertyMedia.objects.filter(property=OuterRef("pk"), type="image")
                .annotate(full_file_url=Concat(Value("/media/"), F("file"), output_field=CharField()))
                .values("full_file_url")[:1]
            ),
            # Annotate is_compared based on whether the property is in the user's comparison list
            is_compared=(
                Exists(CompareProperty.objects.filter(user=user, property=OuterRef("pk")))
                if user.is_authenticated and hasattr(user, "prospectprofile")
                else Value(None, output_field=BooleanField())
            ),
            # Annotate is_favorited based on whether the property is in the user's favorite list
            is_favorited=(
                Exists(ProspectFavoriteProperty.objects.filter(prospect=cast(Any, user).prospectprofile, property=OuterRef("pk")))
                if user.is_authenticated and hasattr(user, "prospectprofile")
                else Value(None, output_field=BooleanField())
            ),
        )

        property_id = request.query_params.get("property_id")
        if property_id:
            properties = properties.exclude(id=property_id)

        # Return available units list with a number of bedrooms based on the provided bed parameter.
        bed = request.query_params.get("bed")
        if bed:
            properties = properties.filter(number_of_bedroom=bed)

        paginated_queryset = self.paginate_queryset(cast(Any, properties))
        if paginated_queryset is not None:
            serializer = PropertyAvailableUnitsSerializer(paginated_queryset, many=True)
            return self.get_paginated_response(serializer.data)

        serializer = PropertyAvailableUnitsSerializer(properties, many=True)

        return Response(serializer.data, status=status.HTTP_200_OK)

    @action(detail=False, methods=["post"])
    def generate_description(self, request: Request) -> Response:
        """
        Return an automated professional building description with ChatGPT
        """
        building_info = request.data

        content = f"building_info: {building_info} \n\n \
            Give me a professional description of the building depending on above the building_info."

        generated_building_description = get_chatgpt_response(str(content))

        return Response(
            {"generated_building_description": generated_building_description}, status=status.HTTP_201_CREATED
        )

    @action(detail=False, methods=["post"])
    def re_generate_description(self, request: Request) -> Response:
        """
        Return an automated professional building description with ChatGPT
        """
        content = request.data.get("content", None)
        previous_response = request.data.get("previous_response", None)
        generated_building_description = get_chatgpt_response(str(content), str(previous_response))

        return Response(
            {"generated_building_description": generated_building_description}, status=status.HTTP_201_CREATED
        )

    @action(detail=False, methods=["get"])
    def building_list_for_map_search(self, request: Request) -> Response:
        serializer = BuildingSearchMapSerializer(self.filter_queryset(self.get_queryset()), many=True)
        return Response({"results": serializer.data}, status=200)

    @action(detail=True, methods=["get"])
    def building_info(self, request: Request, pk: Optional[str] = None) -> Response:
        building = self.get_object()
        serializer = BuildingInfoSerializerRead(building)
        return Response(serializer.data, status=200)
