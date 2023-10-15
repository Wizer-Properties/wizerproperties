from rest_framework import viewsets
from .permissions import PropertyPermission
from .serializers import PropertySerializer
from property.models import Property


class PropertyViewSet(viewsets.ModelViewSet):
    queryset = Property.objects.all()
    serializer_class = PropertySerializer
    permission_classes = [PropertyPermission]

    def get_serializer_context(self):
        context = super().get_serializer_context()
        context.update(
            {
                "request": self.request,
            }
        )
        return context
