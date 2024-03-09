from rest_framework import viewsets
from building.api.permissions import BuildingReviewPermission
from building.api.serializers import BuildingReviewSerializer
from building.models import BuildingReview


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
