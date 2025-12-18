from rest_framework import viewsets
from user.api.serializers import DeveloperProfileSerializer, AgentProfileSerializer, ProspectProfileSerializer
from user.api.permissions import DeveloperProfilePermission, AgentProfilePermission, ProspectProfilePermission
from user.models import DeveloperProfile, AgentProfile, ProspectProfile
from rest_framework.permissions import IsAuthenticated
from typing import Any, Dict, cast
from user.models import User
from django.db.models import QuerySet


class BaseProfileViewSet(viewsets.ModelViewSet):  # type: ignore[type-arg]
    def get_serializer_context(self) -> Dict[str, Any]:
        context = super().get_serializer_context()
        user_type = self.request.data.get('user_type')
        user = self.request.user if self.request.user.is_authenticated else None
        context.update(
            {
                "user": user,
                "user_type": user_type,
            }
        )
        return context


class DeveloperProfileViewSet(BaseProfileViewSet):
    serializer_class = DeveloperProfileSerializer
    permission_classes = [IsAuthenticated]

    def get_queryset(self) -> QuerySet[DeveloperProfile]:
        return DeveloperProfile.objects.filter(user=cast(User, self.request.user))


class AgentProfileViewSet(BaseProfileViewSet):
    serializer_class = AgentProfileSerializer
    permission_classes = [IsAuthenticated]

    def get_queryset(self) -> QuerySet[AgentProfile]:
        return AgentProfile.objects.filter(user=cast(User, self.request.user))


class ProspectProfileViewSet(BaseProfileViewSet):
    serializer_class = ProspectProfileSerializer
    permission_classes = [IsAuthenticated]

    def get_queryset(self) -> QuerySet[ProspectProfile]:
        return ProspectProfile.objects.filter(user=cast(User, self.request.user))
