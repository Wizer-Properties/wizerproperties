from typing import Any, Optional, Union, TYPE_CHECKING
from rest_framework import serializers
from building.models import BuildingReview

if TYPE_CHECKING:
    _Base = serializers.ModelSerializer[BuildingReview]
else:
    _Base = serializers.ModelSerializer


class BuildingReviewSerializer(_Base):
    reviewer_details = serializers.SerializerMethodField()

    class Meta:
        model = BuildingReview
        fields = ["id", "building", "rating", "review_text", "reviewer_details", "created_at"]
        extra_kwargs = {
            "rating": {"required": True, "allow_null": False},
            "review_text": {"required": True, "allow_null": False},
            "building": {"write_only": True, "required": True, "allow_null": False},
        }

    def validate(self, attrs: dict[str, Any]) -> dict[str, Any]:
        instance = BuildingReview(**attrs)
        request = self.context.get("request")
        user = request.user if request else None

        instance.user = user
        instance.full_clean()  # Perform full validation before saving

        return attrs

    def create(self, validated_data: dict[str, Any]) -> BuildingReview:
        request = self.context.get("request")
        if request and request.user.is_authenticated:
            validated_data["user"] = request.user
        
        return super().create(validated_data)

    def get_reviewer_details(self, instance: BuildingReview) -> dict[str, Any]:
        if instance.user:
            user_details: dict[str, Any] = {}
            if hasattr(instance.user, "prospectprofile"):
                prospect = instance.user.prospectprofile
                user_details["fullname"] = f"{prospect.first_name} {prospect.last_name}"

            return {"id": instance.user.id, "user_type": instance.user.user_type, **user_details}
        return {}
