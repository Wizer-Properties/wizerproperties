from rest_framework import viewsets, status, permissions
from rest_framework.response import Response
from rest_framework.decorators import action
from rest_framework.exceptions import ValidationError

from property.api.serializers import SavedSearchSerializer
from property.models import SavedSearch


class SavedSearchViewSet(viewsets.ModelViewSet):
    """
    ViewSet for managing saved property searches.
    Allows prospects to save, retrieve, update, and delete their search criteria.
    """
    serializer_class = SavedSearchSerializer
    permission_classes = [permissions.IsAuthenticated]

    def get_queryset(self):
        """Return saved searches for the authenticated user's prospect profile."""
        if not hasattr(self.request.user, "prospectprofile"):
            return SavedSearch.objects.none()
        return SavedSearch.objects.filter(
            prospect=self.request.user.prospectprofile,
            is_active=True
        ).order_by("-created_at")

    def get_serializer_context(self):
        """Add request to serializer context."""
        context = super().get_serializer_context()
        context["request"] = self.request
        return context

    def perform_create(self, serializer):
        """Create a saved search for the authenticated user."""
        if not hasattr(self.request.user, "prospectprofile"):
            raise ValidationError("Only prospects can save searches.")
        serializer.save(prospect=self.request.user.prospectprofile)

    @action(detail=True, methods=["post"])
    def apply(self, request, pk=None):
        """
        Apply a saved search by returning its search parameters.
        This endpoint is used to restore search filters from a saved search.
        """
        try:
            saved_search = self.get_object()
            return Response({
                "search_params": saved_search.search_params,
                "name": saved_search.name
            }, status=status.HTTP_200_OK)
        except SavedSearch.DoesNotExist:
            return Response(
                {"detail": "Saved search not found."},
                status=status.HTTP_404_NOT_FOUND
            )

