from rest_framework import serializers
from building.models import BuildingReview


class BuildingReviewSerializer(serializers.ModelSerializer):
    reviewer_details = serializers.SerializerMethodField()

    class Meta:
        model = BuildingReview
        fields = ["id", "building", "rating", "review_text", "reviewer_details", "created_at"]
        extra_kwargs = {
            "rating": {"required": True, "allow_null": False},
            "review_text": {"required": True, "allow_null": False},
            "building": {"write_only": True, "required": True, "allow_null": False},
        }

    def validate(self, attrs):
        instance = BuildingReview(**attrs)
        user = self.context["request"].user

        instance.user = user
        instance.full_clean()  # Perform full validation before saving

        return attrs

    def create(self, request, *args, **kwargs):
        instance = super().create(request, *args, **kwargs)
        instance.user = self.context["request"].user
        instance.save()
        return instance

    def get_reviewer_details(self, instance):
        if instance.user:
            user_details = {}
            if instance.user.prospectprofile:
                prospect = instance.user.prospectprofile
                user_details["fullname"] = f"{prospect.first_name} {prospect.last_name}"

            return {"id": instance.user.id, "user_type": instance.user.user_type, **user_details}
        return {}
