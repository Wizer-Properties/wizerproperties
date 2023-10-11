from rest_framework import viewsets
from .permissions import BuildingPermission
from .serializers import BuildingSerializer
from building.models import Building


class BuildingViewSet(viewsets.ModelViewSet):
    queryset = Building.objects.all()
    serializer_class = BuildingSerializer
    permission_classes = [BuildingPermission]
