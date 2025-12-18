from typing import Any, cast, TYPE_CHECKING, Dict
from rest_framework import serializers
from user.models import DeveloperProfile, AgentProfile, ProspectProfile, User
from phonenumber_field.serializerfields import PhoneNumberField
from utils.general_func import show_custom_error_message

if TYPE_CHECKING:
    from django.http import HttpRequest
    _Base = serializers.ModelSerializer[User]
else:
    _Base = serializers.ModelSerializer


class BaseProfileSerializer(_Base):
    name = serializers.CharField(source="user.username", read_only=True)
    email = serializers.EmailField(source="user.email", read_only=True)
    user_type = serializers.CharField(source="user.user_type", read_only=True)
    phone_number = PhoneNumberField(required=True)

    class Meta:
        abstract = True
        fields = ["name", "email", "user_type", "phone_number", "address", "latitude", "longitude"]
        extra_kwargs = {
            "company_logo": {"required": True, "allow_null": False},
            "company_name": {"required": True, "allow_null": False},
            "address": {"required": True, "allow_null": False},
            "company_details": {"required": True, "allow_null": False},
            "first_name": {"required": True, "allow_null": False},
            "last_name": {"required": True, "allow_null": False},
            "gender": {"required": True, "allow_null": False},
        }

    def __init__(self, instance: Any = None, *args: Any, **kwargs: Any) -> None:
        super().__init__(instance, *args, **kwargs)
        if self.instance:
            instance = cast(Any, self.instance)
            if hasattr(instance, 'user') and instance.user.user_type in ["developer", "agent"]:
                self.fields["company_logo"].required = False
        show_custom_error_message(dict(self.fields))
    def validate(self, data: Dict[str, Any]) -> Dict[str, Any]:
        user = self.context["user"]
        user_type = self.context.get("user_type")
        
        if not user_type:
            raise serializers.ValidationError("User type is required.")

        model = getattr(self.Meta, 'model')
        existing_profile = model.objects.filter(user=user).first()

        if existing_profile and not self.instance:
            raise serializers.ValidationError("A profile already exists for this user.")

        data["user"] = user
        data["user_type"] = user_type
        return data

    def create(self, validated_data: Dict[str, Any]) -> Any:
        user_type = validated_data.pop("user_type")
        model = getattr(self.Meta, 'model')
        profile_instance = model.objects.create(**validated_data)
        user = cast(User, validated_data.get("user"))
        
        if user:
            user.is_complete_profile = True
            user.user_type = user_type
            user.save()
        return profile_instance


class DeveloperProfileSerializer(BaseProfileSerializer):
    class Meta(BaseProfileSerializer.Meta):
        model = DeveloperProfile
        fields = BaseProfileSerializer.Meta.fields + [
            "company_logo",
            "company_name",
            "company_details",
        ]


class AgentProfileSerializer(BaseProfileSerializer):
    class Meta(BaseProfileSerializer.Meta):
        model = AgentProfile
        fields = BaseProfileSerializer.Meta.fields + [
            "company_logo",
            "company_name",
            "company_details",
        ]


class ProspectProfileSerializer(BaseProfileSerializer):
    class Meta(BaseProfileSerializer.Meta):
        model = ProspectProfile
        fields = BaseProfileSerializer.Meta.fields + [
            "first_name",
            "last_name",
            "gender",
        ]
