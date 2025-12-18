from typing import Any, Dict, List, Optional, Union, TYPE_CHECKING, cast
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

    def validate(self, attrs: Dict[str, Any]) -> Dict[str, Any]:
        instance = BuildingReview(**attrs)
        request = self.context.get("request")
        user = request.user if request else None

        instance.user = user
        instance.full_clean()  # Perform full validation before saving

        return attrs

    def create(self, validated_data: Dict[str, Any]) -> BuildingReview:
        instance = super().create(validated_data)
        request = self.context.get("request")
        if request:
            instance.user = request.user
            instance.save()
        return instance

    def get_reviewer_details(self, instance: BuildingReview) -> Dict[str, Any]:
        if instance.user:
            user_details: Dict[str, Any] = {}
            if hasattr(instance.user, "prospectprofile"):
                prospect = instance.user.prospectprofile
                user_details["fullname"] = f"{prospect.first_name} {prospect.last_name}"

            return {"id": instance.user.id, "user_type": instance.user.user_type, **user_details}
        return {}
