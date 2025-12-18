from rest_framework import viewsets, status, permissions, serializers
from rest_framework.response import Response
from typing import Any, Dict, Optional, cast, TYPE_CHECKING
from property.api.permissions import ProspectPropertyFavoritePermission
from property.api.serializers import ProspectFavoritePropertySerializer
from property.models import ProspectFavoriteProperty


if TYPE_CHECKING:
    _Base = viewsets.ModelViewSet[ProspectFavoriteProperty]
else:
    _Base = viewsets.ModelViewSet


class ProspectFavoritePropertyViewSet(_Base):
    serializer_class = ProspectFavoritePropertySerializer
    permission_classes = [permissions.IsAuthenticated, ProspectPropertyFavoritePermission]
    serializer_method_fields = ["POST", "GET", "DELETE"]

    def get_queryset(self) -> Any:
        return ProspectFavoriteProperty.objects.select_related("prospect", "property").filter(
            prospect=cast(Any, self.request.user).prospectprofile
        )

    def get_serializer_context(self) -> Dict[str, Any]:
        # Get the default context from the parent class
        context: Dict[str, Any] = super().get_serializer_context()

        # Add custom data to the context
        context["request"] = self.request

        return context

    def perform_destroy(self, instance: ProspectFavoriteProperty) -> None:
        instance.delete()

    def destroy(self, request: Any, *args: Any, **kwargs: Any) -> Response:
        # Get the property from the request data
        property = self.request.data.get("property")

        if property is None:
            return Response({"property": ["This field is required."]}, status=status.HTTP_400_BAD_REQUEST)

        # Try to get and delete the FavoriteProperty instance based on prospect and property
        try:
            favorite_property = ProspectFavoriteProperty.objects.get(
                prospect=cast(Any, self.request.user).prospectprofile, property=property
            )
            favorite_property.delete()
            return Response(status=status.HTTP_204_NO_CONTENT)
        except ProspectFavoriteProperty.DoesNotExist:
            return Response({"detail": "Not found."}, status=status.HTTP_404_NOT_FOUND)
