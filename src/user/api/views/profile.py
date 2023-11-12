from rest_framework import viewsets
from user.api.serializers import DeveloperProfileSerializer, AgentProfileSerializer, ProspectProfileSerializer
from user.api.permissions import DeveloperProfilePermission, AgentProfilePermission, ProspectProfilePermission
from user.models import DeveloperProfile, AgentProfile, ProspectProfile


class BaseProfileViewSet(viewsets.ModelViewSet):
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
    permission_classes = [DeveloperProfilePermission]

    def get_queryset(self):
        return DeveloperProfile.objects.filter(user=self.request.user)


class AgentProfileViewSet(BaseProfileViewSet):
    serializer_class = AgentProfileSerializer
    permission_classes = [AgentProfilePermission]

    def get_queryset(self):
        return AgentProfile.objects.filter(user=self.request.user)


class ProspectProfileViewSet(BaseProfileViewSet):
    serializer_class = ProspectProfileSerializer
    permission_classes = [ProspectProfilePermission]

    def get_queryset(self):
        return ProspectProfile.objects.filter(user=self.request.user)
