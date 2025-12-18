from rest_framework import viewsets, status, serializers
from rest_framework.response import Response
from typing import Any, Dict, Optional, cast, TYPE_CHECKING
from property.api.permissions import ComparePropertyPermission
from property.api.serializers import ComparePropertySerializer
from property.models import CompareProperty
from user.models import User


if TYPE_CHECKING:
    _Base = viewsets.ModelViewSet[CompareProperty]
else:
    _Base = viewsets.ModelViewSet


class ComparePropertyViewSet(_Base):
    serializer_class = ComparePropertySerializer
    permission_classes = [ComparePropertyPermission]

    def get_queryset(self) -> Any:
        return CompareProperty.objects.select_related("user", "property", "property__building").filter(user=cast(User, self.request.user)).order_by("-created_at")

    def get_serializer_context(self) -> Dict[str, Any]:
        # Get the default context from the parent class
        context: Dict[str, Any] = super().get_serializer_context()
        context.update(
            {
                "request": self.request,
            }
        )
        return context

    def perform_create(self, serializer: serializers.BaseSerializer[CompareProperty]) -> None:
        # Check if user already has 3 properties in comparison
        user = cast(User, self.request.user)
        existing_count = CompareProperty.objects.filter(user=user).count()
        if existing_count >= 3:
            raise serializers.ValidationError(
                "Maximum 3 properties can be compared. Please remove one property before adding another."
            )
        serializer.save(user=user)

    def destroy(self, request: Any, *args: Any, **kwargs: Any) -> Response:
        """
        Custom destroy method to handle deletion by property ID from request body.
        """
        property_id = request.data.get("property")

        if property_id is None:
            return Response({"property": ["This field is required."]}, status=status.HTTP_400_BAD_REQUEST)

        # Try to get and delete the CompareProperty instance based on user and property
        try:
            compare_property = CompareProperty.objects.get(user=request.user, property=property_id)
            compare_property.delete()
            return Response(status=status.HTTP_204_NO_CONTENT)
        except CompareProperty.DoesNotExist:
            return Response({"detail": "Not found."}, status=status.HTTP_404_NOT_FOUND)
