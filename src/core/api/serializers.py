from typing import TYPE_CHECKING
from rest_framework import serializers
from core.models import Contact

if TYPE_CHECKING:
    _Base = serializers.ModelSerializer[Contact]
else:
    _Base = serializers.ModelSerializer


class ContactSerializer(_Base):
    class Meta:
        model = Contact
        fields = ["id", "email", "subject", "body"]
        extra_kwargs = {
            "email": {"required": True, "allow_null": False},
            "subject": {"required": True, "allow_null": False},
            "body": {"required": True, "allow_null": False}
        }
