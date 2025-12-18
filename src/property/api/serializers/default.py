from rest_framework import serializers
from property.models import Property
from typing import Optional, Any, TYPE_CHECKING

if TYPE_CHECKING:
    _Base = serializers.ModelSerializer[Property]
else:
    _Base = serializers.ModelSerializer


class PropertySerializer(_Base):

    class Meta:
        model = Property
        fields = [
            "id",
            "title",
            "description",
            "price",
            "price_per_sqm",
            "floor_number",
            "unit_area",
            "number_of_bedroom",
            "number_of_bathroom",
            "created_at",
            "updated_at",
        ]
        
class PropertySerializerRead(_Base):
    unit_position = serializers.SerializerMethodField()
    
    class Meta:
        model = Property
        fields = [
            "id",
            "have_tenant_occupied",
            "tenant_occupied_validity",
            "balcony_direction",
            "main_door_direction",
            "unit_position",
            "have_vacant",
            "have_owner_occupied",
            "have_bathtub",
            "have_duplex",
            "created_at",
            "updated_at",
        ]
        
    def get_unit_position(self, obj: Property) -> Optional[str]:
        return obj.get_unit_position_display() if obj.unit_position else None
        
