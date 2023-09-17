from rest_framework import serializers
from user.models import DeveloperProfile, AgentProfile, ProspectProfile
from phonenumber_field.serializerfields import PhoneNumberField
from utils.general_func import show_custom_error_message


class BaseProfileSerializer(serializers.ModelSerializer):
    phone_number = PhoneNumberField(required=True)

    class Meta:
        abstract = True
        extra_kwargs = {
            "user": {"required": False},
            "first_name": {"required": True, "allow_null": False},
            "last_name": {"required": True, "allow_null": False},
            "email": {"required": True, "allow_null": False},
            "gender": {"required": True, "allow_null": False},
            "picture": {"required": True, "allow_null": False},
            "address": {"required": True, "allow_null": False},
            "company_logo": {"required": True, "allow_null": False},
            "company_name": {"required": True, "allow_null": False},
            "company_address": {"required": True, "allow_null": False},
            "company_details": {"required": True, "allow_null": False},
        }

    def __init__(self, instance=None, data=..., **kwargs):
        super().__init__(instance, data, **kwargs)
        show_custom_error_message(self.fields)

    def validate(self, data):
        # Get the user associated with the profile being created/updated
        user = self.context["user"]

        # Check if the user already has a corresponding profile
        existing_profile = self.Meta.model.objects.filter(user=user).first()

        if existing_profile and not self.instance:
            raise serializers.ValidationError("A profile already exists for this user.")

        # Append the 'user' to the validated_data
        data["user"] = user

        return data


class DeveloperProfileSerializer(BaseProfileSerializer):
    class Meta(BaseProfileSerializer.Meta):
        model = DeveloperProfile
        fields = "__all__"


class AgentProfileSerializer(BaseProfileSerializer):
    class Meta(BaseProfileSerializer.Meta):
        model = AgentProfile
        fields = "__all__"


class ProspectProfileSerializer(BaseProfileSerializer):
    class Meta(BaseProfileSerializer.Meta):
        model = ProspectProfile
        fields = "__all__"
