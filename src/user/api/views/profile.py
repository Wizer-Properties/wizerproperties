from rest_framework import viewsets
from rest_framework.permissions import IsAuthenticated
from user.api.serializers import DeveloperProfileSerializer, AgentProfileSerializer, ProspectProfileSerializer


class BaseProfileViewSet(viewsets.ModelViewSet):
    permission_classes = [IsAuthenticated]
    http_method_names = ["post"]

    def get_serializer_context(self):
        context = super().get_serializer_context()
        context.update(
            {
                "user": self.request.user,
            }
        )
        return context


class DeveloperProfileViewSet(BaseProfileViewSet):
    serializer_class = DeveloperProfileSerializer


class AgentProfileViewSet(BaseProfileViewSet):
    serializer_class = AgentProfileSerializer


class ProspectProfileViewSet(BaseProfileViewSet):
    serializer_class = ProspectProfileSerializer
