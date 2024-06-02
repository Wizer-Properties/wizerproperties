from rest_framework import serializers
from advertise.models import Reel


class ReelSerializer(serializers.ModelSerializer):
    property_title = serializers.CharField(source="property.title", read_only=True)

    class Meta:
        model = Reel
        fields = [
            "id",
            "url",
            "social_media",
            "category",
            "status",
            "property",
            "property_title",
        ]

    def validate(self, attrs):
        """To check 'reel' validity needs 'user' instance but
        there is no 'user' instance in attrs"""

        user_obj = self.context["request"].user
        if hasattr(user_obj, "developerprofile") or hasattr(user_obj, "agentprofile"):
            attrs["created_by"] = user_obj

        if self.context["request"].method in ["PUT", "PATCH"]:
            instance = self.instance
            instance_order_dict = instance.__dict__  # 'reel' instance OrderDict(object's data as dict)
            attrs = instance_order_dict | attrs  # Updating 'instance' OrderDict value

            reel_object_fields = (
                "url",
                "social_media",
                "category",
                "status",
                "property",
                "created_by",
            )

            for key in dict(attrs):
                # Removes unnecessary fields
                if key not in reel_object_fields:
                    attrs.pop(key, None)

        instance = Reel(**attrs)
        instance.full_clean()  # Checks model validation

        return attrs
