from rest_framework import viewsets
from user.api.serializers import DeveloperProfileSerializer, AgentProfileSerializer, ProspectProfileSerializer
from user.api.permissions import DeveloperProfilePermission, AgentProfilePermission, ProspectProfilePermission
from user.models import DeveloperProfile, AgentProfile, ProspectProfile
from rest_framework.permissions import IsAuthenticated


class BaseProfileViewSet(viewsets.ModelViewSet):
    def get_serializer_context(self):
        context = super().get_serializer_context()
        user_type = self.request.data.get('user_type')
        context.update(
            {
                "user": self.request.user,
                "user_type": user_type,
            }
        )
        return context


class DeveloperProfileViewSet(BaseProfileViewSet):
    serializer_class = DeveloperProfileSerializer
    permission_classes = [IsAuthenticated]

    def get_queryset(self):
        return DeveloperProfile.objects.filter(user=self.request.user)


class AgentProfileViewSet(BaseProfileViewSet):
    serializer_class = AgentProfileSerializer
    permission_classes = [IsAuthenticated]

    def get_queryset(self):
        return AgentProfile.objects.filter(user=self.request.user)


class ProspectProfileViewSet(BaseProfileViewSet):
    serializer_class = ProspectProfileSerializer
    permission_classes = [IsAuthenticated]

    def get_queryset(self):
        return ProspectProfile.objects.filter(user=self.request.user)
