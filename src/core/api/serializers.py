from rest_framework import serializers
from core.models import Contact


class ContactSerializer(serializers.ModelSerializer):
    class Meta:
        model = Contact
        fields = ["id", "email", "subject", "body"]
        extra_kwargs = {
            "email": {"required": True, "allow_null": False},
            "subject": {"required": True, "allow_null": False},
            "body": {"required": True, "allow_null": False}
        }
