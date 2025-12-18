from typing import TYPE_CHECKING
from rest_framework import serializers
from property.models import PropertyMedia

if TYPE_CHECKING:
    _Base = serializers.ModelSerializer[PropertyMedia]
else:
    _Base = serializers.ModelSerializer


class PropertyMediaSerializer(_Base):
    class Meta:
        model = PropertyMedia
        fields = ["id", "file", "type"]
