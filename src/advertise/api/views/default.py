from rest_framework import viewsets, status
from rest_framework.response import Response
from rest_framework.decorators import action
from django.shortcuts import get_object_or_404
from advertise.models import Reel
from advertise.api.serializers import ReelSerializer, ActiveReelSerializer
from advertise.api.permissions import ReelPermission
from advertise.api.pagination import ReelPagination


class ReelViewSet(viewsets.ModelViewSet):
    serializer_class = ReelSerializer
    permission_classes = [ReelPermission]
    pagination_class = ReelPagination
    queryset = Reel.objects.all()
    ordering = ["-created_at"]  # Default ordering

    def list(self, request):
        # Returns Agent/Developer Reels

        queryset = self.get_queryset().filter(created_by=request.user).order_by("-created_at")
        paginator = self.pagination_class()
        paginated_queryset = paginator.paginate_queryset(queryset, request)
        serializer = self.serializer_class(paginated_queryset, many=True)
        return paginator.get_paginated_response(serializer.data)

    def retrieve(self, request, pk=None):
        reel_obj = get_object_or_404(self.get_queryset(), pk=pk)
        serializer = self.serializer_class(reel_obj)
        if reel_obj.status == "active":
            return Response(serializer.data)
        
        if request.user.is_authenticated and reel_obj.created_by == request.user:
            return Response(serializer.data)
        
        return Response({"detail": "Not found."}, status=status.HTTP_404_NOT_FOUND)

    @action(detail=False, methods=["get"], url_path="active")
    def active_reels(self, request):
        # Returns active reels and filter reels if category provides

        category = request.query_params.get("category", None)
        query_params = {}   # Query parameter will append here
        if category:
            query_params.update({"category": category})

        active_reels = self.get_queryset().filter(**query_params, status="active").order_by("-created_at")
        paginator = self.pagination_class()
        paginated_queryset = paginator.paginate_queryset(active_reels, request)
        serializer = ActiveReelSerializer(paginated_queryset, many=True)
        return paginator.get_paginated_response(serializer.data)
