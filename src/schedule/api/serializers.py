from rest_framework import serializers
from schedule.models import VisitingSchedule

class VisitingScheduleSerializer(serializers.ModelSerializer):
    class Meta:
        model = VisitingSchedule
        fields = (
            "id",
            "visiting_time",
            "status",
            "content_type",
            "object_id"
        )
        extra_kwargs = {
            "status": {"read_only": True},
        }

    def validate(self, attrs):
        if self.context["request"].method == "PATCH":
            instance = self.instance
            if instance.status != "pending":
                raise serializers.ValidationError("Can not update visiting schedule")

            instance_order_dict = (
                instance.__dict__
            )  # VisitingSchedule instance OrderDict
            attrs = instance_order_dict | attrs  # Updating 'instance' OrderDict value with new value

            """'attrs' will contains only those key, which are update-able"""
            attrs = {field: attrs[field] for field in ["visiting_time", "content_type", "object_id"]}

        """We are assigning requested user as owner"""
        attrs["prospect"] = self.context["request"].user.prospectprofile
        instance = VisitingSchedule(**attrs)
        try:
            instance.full_clean()
        except ValidationError as e:
            raise serializers.ValidationError(e.message_dict)

        return attrs
