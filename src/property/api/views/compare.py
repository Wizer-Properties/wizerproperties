from rest_framework import viewsets, status, serializers
from rest_framework.response import Response
from property.api.permissions import ComparePropertyPermission
from property.api.serializers import ComparePropertySerializer
from property.models import CompareProperty


class ComparePropertyViewSet(viewsets.ModelViewSet):
    serializer_class = ComparePropertySerializer
    permission_classes = [ComparePropertyPermission]

    def get_queryset(self):
        return CompareProperty.objects.select_related("user", "property", "property__building").filter(user=self.request.user)

    def get_serializer_context(self):
        # Get the default context from the parent class
        context = super(ComparePropertyViewSet, self).get_serializer_context()
        context.update(
            {
                "request": self.request,
            }
        )
        return context

    def perform_create(self, serializer):
        # Check if user already has 3 properties in comparison
        existing_count = CompareProperty.objects.filter(user=self.request.user).count()
        if existing_count >= 3:
            raise serializers.ValidationError(
                "Maximum 3 properties can be compared. Please remove one property before adding another."
            )
        serializer.save(user=self.request.user)

    def perform_destroy(self, serializer):
        # Get the property from the request data
        property = self.request.data.get("property")

        if property is None:
            return Response({"property": ["This field is required."]}, status=status.HTTP_400_BAD_REQUEST)

        # Try to get and delete the CompareProperty instance based on user and property
        try:
            compare_property = CompareProperty.objects.get(user=self.request.user, property=property)
            compare_property.delete()
            return Response(status=status.HTTP_204_NO_CONTENT)
        except CompareProperty.DoesNotExist:
            return Response({"detail": "Not found."}, status=status.HTTP_404_NOT_FOUND)
