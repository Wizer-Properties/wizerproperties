from rest_framework import serializers
from advertise.models import Reel
from user.models import User, DeveloperProfile, AgentProfile
from advertise.api.serializers import ReelSerializer


class DeveloperProfileSerializer(serializers.ModelSerializer):
    class Meta:
        model = DeveloperProfile
        fields = [
            "phone_number",
            "company_logo",
            "company_name",
        ]

class AgentProfileProfileSerializer(serializers.ModelSerializer):
    class Meta:
        model = AgentProfile
        fields = [
            "phone_number",
            "company_logo",
            "company_name",
        ]

class UserSerializer(serializers.ModelSerializer):
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
