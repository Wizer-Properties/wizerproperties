from rest_framework import viewsets, status
from advertise.models import Reel
from advertise.api.serializers import ReelSerializer
from advertise.api.permissions import ReelPermission
from advertise.api.pagination import ReelPagination


class ReelViewSet(viewsets.ModelViewSet):
    serializer_class = ReelSerializer
    permission_classes = [ReelPermission]
    queryset = Reel.objects.all()
    ordering = ["-created_at"]  # Default ordering
    pagination_class = ReelPagination
