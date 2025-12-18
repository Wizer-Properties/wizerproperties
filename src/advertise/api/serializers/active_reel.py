from typing import TYPE_CHECKING
from rest_framework import serializers
from user.models import User, DeveloperProfile, AgentProfile
from advertise.api.serializers import ReelSerializer

if TYPE_CHECKING:
    _DevBase = serializers.ModelSerializer[DeveloperProfile]
    _AgentBase = serializers.ModelSerializer[AgentProfile]
    _UserBase = serializers.ModelSerializer[User]
else:
    _DevBase = serializers.ModelSerializer
    _AgentBase = serializers.ModelSerializer
    _UserBase = serializers.ModelSerializer


class DeveloperProfileSerializer(_DevBase):
    class Meta:
        model = DeveloperProfile
        fields = [
            "phone_number",
            "company_logo",
            "company_name",
        ]

class AgentProfileProfileSerializer(_AgentBase):
    class Meta:
        model = AgentProfile
        fields = [
            "phone_number",
            "company_logo",
            "company_name",
        ]

class UserSerializer(_UserBase):
    developer = DeveloperProfileSerializer(source="developerprofile", read_only=True)
    agent = AgentProfileProfileSerializer(source="agentprofile", read_only=True)

    class Meta:
        model = User
        fields = [
            "id",
            "email",
            "developer",
            "agent",
        ]

class ActiveReelSerializer(ReelSerializer):
    """We are showing Agent&Developer info besides reel info using this serializer"""

    user = UserSerializer(source="created_by", read_only=True)

    class Meta(ReelSerializer.Meta):
        fields = ReelSerializer.Meta.fields + ["user"]
