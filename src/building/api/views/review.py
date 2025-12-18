from rest_framework import viewsets
from typing import Any, Dict, TYPE_CHECKING
from building.api.permissions import BuildingReviewPermission
from building.api.serializers import BuildingReviewSerializer
from building.models import BuildingReview

if TYPE_CHECKING:
    _Base = viewsets.ModelViewSet[BuildingReview]
else:
    _Base = viewsets.ModelViewSet


class BuildingReviewViewSet(_Base):
    serializer_class = BuildingReviewSerializer
    permission_classes = [BuildingReviewPermission]
    serializer_method_fields = ["POST"]

    def get_queryset(self) -> Any:
        building_id = self.request.GET.get("building_id") or self.request.data.get("building_id")
        if not building_id:
            return BuildingReview.objects.none()
        return BuildingReview.objects.filter(building_id=building_id)

    def get_serializer_context(self) -> Dict[str, Any]:
        context: Dict[str, Any] = super().get_serializer_context()
        context["request"] = self.request
        return context
