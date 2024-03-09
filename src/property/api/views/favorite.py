from rest_framework import viewsets, status, permissions
from rest_framework.response import Response
from property.api.permissions import ProspectPropertyFavoritePermission
from property.api.serializers import ProspectFavoritePropertySerializer
from property.models import ProspectFavoriteProperty


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

        # Try to get and delete the FavoriteProperty instance based on prospect and property
        try:
            compare_property = ProspectFavoriteProperty.objects.get(
                prospect=self.request.user.prospectprofile, property=property
            )
            compare_property.delete()
            return Response(status=status.HTTP_204_NO_CONTENT)
        except ProspectFavoriteProperty.DoesNotExist:
            return Response({"detail": "Not found."}, status=status.HTTP_404_NOT_FOUND)
