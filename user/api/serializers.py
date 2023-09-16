from rest_framework import serializers
from user.models import DeveloperProfile, AgentProfile, ProspectProfile


class DeveloperProfileSerializer(serializers.ModelSerializer):
    class Meta:
        model = DeveloperProfile
        fields = "__all__"


class AgentProfileSerializer(serializers.ModelSerializer):
    class Meta:
        model = AgentProfile
        fields = "__all__"


class ProspectProfileSerializer(serializers.ModelSerializer):
    class Meta:
        model = ProspectProfile
        fields = "__all__"
