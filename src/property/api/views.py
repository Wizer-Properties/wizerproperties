from django.utils import timezone
from django.db.models import OuterRef, Subquery, Value, F, CharField, Exists, BooleanField
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
    GeneralPropertySerializer,
)
from .filters import PropertyFilter
from building.api.serializers import BuildingMediaSerializer
from building.models import Building
from property.models import Property, PropertyMedia, CompareProperty, ProspectFavoriteProperty
from openai import OpenAI


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
            is_compared=(
                Exists(CompareProperty.objects.filter(user=user, property=OuterRef("pk")))
                if user.is_authenticated and hasattr(user, "prospectprofile")
                else Value(None, output_field=BooleanField())
            ),
            # Annotate is_favorited based on whether the property is in the user's favorite list
            is_favorited=(
                Exists(ProspectFavoriteProperty.objects.filter(prospect=user.prospectprofile, property=OuterRef("pk")))
                if user.is_authenticated and hasattr(user, "prospectprofile")
                else Value(None, output_field=BooleanField())
            ),
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

            return self._get_paginated_media_files(media_files, serializer_class)
        else:
            return Response({"detail": "Media type is required."}, status=status.HTTP_400_BAD_REQUEST)

    @action(detail=False, methods=["get"])
    def newly_created(self, request):
        """
        Retrieve a list of newly created properties with pagination.
        """
        queryset = self.get_queryset().filter(newlycreatedproperty__isnull=False)
        page = self.paginate_queryset(queryset)

        if page is not None:
            serializer = GeneralPropertySerializer(page, many=True)
            return self.get_paginated_response(serializer.data)

        serializer = GeneralPropertySerializer(queryset, many=True)
        return Response(serializer.data, status=status.HTTP_200_OK)

    @action(detail=False, methods=["get"])
    def popular(self, request):
        """
        Retrieve a list of popular properties with pagination.
        """
        queryset = self.get_queryset().filter(popularproperty__isnull=False)
        page = self.paginate_queryset(queryset)

        if page is not None:
            serializer = GeneralPropertySerializer(page, many=True)
            return self.get_paginated_response(serializer.data)

        serializer = GeneralPropertySerializer(queryset, many=True)
        return Response(serializer.data, status=status.HTTP_200_OK)

    @action(detail=False, methods=["get"])
    def discount(self, request):
        """
        Retrieve a list of discount properties with pagination.
        """
        today = timezone.now().date()
        queryset = self.get_queryset().filter(discountproperty__period__gte=today)
        page = self.paginate_queryset(queryset)

        if page is not None:
            serializer = GeneralPropertySerializer(page, many=True)
            return self.get_paginated_response(serializer.data)

        serializer = GeneralPropertySerializer(queryset, many=True)
        return Response(serializer.data, status=status.HTTP_200_OK)

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
                        "have_access_to_BTS_or_MRT": building.have_access_to_BTS_or_MRT,
                        "have_access_to_ARL": building.have_access_to_ARL,
                    }
                )

        content = f"building_info: \n{building_info} \n\n property_info: \n{property_info} \n\n \
                    Give me a professional description of the property depending on above the building_info and property_info. In one building, \
                    there are many properties, meaning this property_info is within the premises of this building_info."

        print(content)
        client = OpenAI()
        response = client.chat.completions.create(
            model="gpt-3.5-turbo",
            messages=[
                {"role": "user", "content": content},
            ],
        )

        return Response({"generated_description": response.choices[0].message.content}, status=status.HTTP_200_OK)


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

    def perform_destroy(self, serializer):
        # Get the property from the request data
        property = self.request.data.get("property")

        if property is None:
            return Response({"property": ["This field is required."]}, status=status.HTTP_400_BAD_REQUEST)

        # Try to get and delete the CompareProperty instance based on user and property
        try:
            compare_property = CompareProperty.objects.get(user=self.request.user, property=property)
            compare_property.delete()
            return Response(status=status.HTTP_204_NO_CONTENT)
        except CompareProperty.DoesNotExist:
            return Response({"detail": "Not found."}, status=status.HTTP_404_NOT_FOUND)


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

    def perform_destroy(self, serializer):
        # Get the property from the request data
        property = self.request.data.get("property")

        if property is None:
            return Response({"property": ["This field is required."]}, status=status.HTTP_400_BAD_REQUEST)

        # Try to get and delete the CompareProperty instance based on prospect and property
        try:
            compare_property = ProspectFavoriteProperty.objects.get(
                prospect=self.request.user.prospectprofile, property=property
            )
            compare_property.delete()
            return Response(status=status.HTTP_204_NO_CONTENT)
        except CompareProperty.DoesNotExist:
            return Response({"detail": "Not found."}, status=status.HTTP_404_NOT_FOUND)
