from rest_framework import viewsets
from user.models import DeveloperProfile, AgentProfile, ProspectProfile
from user.api.serializers import DeveloperProfileSerializer, AgentProfileSerializer, ProspectProfileSerializer


class DeveloperProfileViewSet(viewsets.ModelViewSet):
    queryset = DeveloperProfile.objects.all()
    serializer_class = DeveloperProfileSerializer


class AgentProfileViewSet(viewsets.ModelViewSet):
    queryset = AgentProfile.objects.all()
    serializer_class = AgentProfileSerializer


class ProspectProfileViewSet(viewsets.ModelViewSet):
    queryset = ProspectProfile.objects.all()
    serializer_class = ProspectProfileSerializer
