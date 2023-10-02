from rest_framework import serializers
from user.models import DeveloperProfile, AgentProfile, ProspectProfile
from phonenumber_field.serializerfields import PhoneNumberField
from utils.general_func import show_custom_error_message


class BaseProfileSerializer(serializers.ModelSerializer):
    phone_number = PhoneNumberField(required=True)

    class Meta:
        abstract = True
        fields = ["email", "phone_number"]
        extra_kwargs = {
            "email": {"required": True, "allow_null": False},
            "company_logo": {"required": True, "allow_null": False},
            "company_name": {"required": True, "allow_null": False},
            "company_address": {"required": True, "allow_null": False},
            "company_details": {"required": True, "allow_null": False},
            "picture": {"required": True, "allow_null": False},
            "first_name": {"required": True, "allow_null": False},
            "last_name": {"required": True, "allow_null": False},
            "gender": {"required": True, "allow_null": False},
            "address": {"required": True, "allow_null": False},
        }

    def __init__(self, instance=None, data=..., **kwargs):
        super().__init__(instance, data, **kwargs)
        show_custom_error_message(self.fields)

    def validate(self, data):
        user = self.context["user"]
        existing_profile = self.Meta.model.objects.filter(user=user).first()

        if existing_profile and not self.instance:
            raise serializers.ValidationError("A profile already exists for this user.")

        data["user"] = user
        return data

    def create(self, validated_data):
        profile_instance = self.Meta.model.objects.create(**validated_data)
        user = validated_data.get("user")
        user.is_complete_profile = True
        user.save()
        return profile_instance


class DeveloperProfileSerializer(BaseProfileSerializer):
    class Meta(BaseProfileSerializer.Meta):
        model = DeveloperProfile
        fields = BaseProfileSerializer.Meta.fields + [
            "company_logo",
            "company_name",
            "company_address",
            "company_details",
        ]


class AgentProfileSerializer(BaseProfileSerializer):
    class Meta(BaseProfileSerializer.Meta):
        model = AgentProfile
        fields = BaseProfileSerializer.Meta.fields + [
            "company_logo",
            "company_name",
            "company_address",
            "company_details",
        ]


class ProspectProfileSerializer(BaseProfileSerializer):
    class Meta(BaseProfileSerializer.Meta):
        model = ProspectProfile
        fields = BaseProfileSerializer.Meta.fields + ["picture", "first_name", "last_name", "gender", "address"]
