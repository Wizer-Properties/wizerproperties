from rest_framework import viewsets
from .permissions import PropertyPermission
from .serializers import PropertySerializer
from .filters import PropertyFilter
from property.models import Property


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
        if self.request.method in ["PATCH", "PUT"]:
            return Property.objects.all()
        return Property.objects.filter(is_active=True)

    def get_serializer_context(self):
        context = super().get_serializer_context()
        context.update(
            {
                "request": self.request,
            }
        )
        return context
