from rest_framework import serializers
from property.models import Property
import logging

logger = logging.getLogger(__name__)


class PropertyComparisonsListSerializer(serializers.ModelSerializer):
    building_title = serializers.SerializerMethodField()
    building_type = serializers.SerializerMethodField()
    building_sub_type = serializers.SerializerMethodField()
    building_status = serializers.SerializerMethodField()
    address = serializers.SerializerMethodField()
    construction_year = serializers.SerializerMethodField()
    quota = serializers.SerializerMethodField()
    furnishing = serializers.SerializerMethodField()
    distance_from_location_to_BTS_or_MRT = serializers.SerializerMethodField()
    distance_from_location_to_ARL = serializers.SerializerMethodField()
    have_freehold = serializers.SerializerMethodField()
    have_leasehold = serializers.SerializerMethodField()
    have_infinity_pool = serializers.SerializerMethodField()
    have_pets_allowed = serializers.SerializerMethodField()
    have_guard_house = serializers.SerializerMethodField()
    have_sauna = serializers.SerializerMethodField()
    have_sky_lounge = serializers.SerializerMethodField()
    have_grocery = serializers.SerializerMethodField()
    have_fitness_area = serializers.SerializerMethodField()
    default_image = serializers.URLField(source="default_image_url", read_only=True, allow_null=True)
    interior_view = serializers.URLField(source="interior_view", read_only=True, allow_null=True)
    ariel_view = serializers.URLField(source="ariel_video_url", read_only=True, allow_null=True)
    facility_view = serializers.SerializerMethodField()
    location_view = serializers.SerializerMethodField()
    view = serializers.SerializerMethodField()
    
    def _get_building_field(self, obj, field_name, default=None):
        """Helper method to safely get building field values"""
        try:
            if obj and obj.building:
                value = getattr(obj.building, field_name, default)
                # Don't try to call the value - just return it as-is
                # Django's get_*_display() methods are already handled separately
                return value
        except (AttributeError, TypeError, Exception) as e:
            logger.debug(f"Error getting building field {field_name}: {str(e)}")
        return default
    
    def get_building_title(self, obj):
        return self._get_building_field(obj, 'title')
    
    def get_building_type(self, obj):
        return self._get_building_field(obj, 'type')
    
    def get_building_sub_type(self, obj):
        try:
            if obj.building:
                # get_sub_type_display() is a Django method for choice fields
                # It returns empty string if sub_type is None, which is fine
                return obj.building.get_sub_type_display() or None
        except (AttributeError, TypeError, Exception):
            pass
        return None
    
    def get_building_status(self, obj):
        try:
            if obj.building:
                # get_status_display() is a Django method for choice fields
                # It returns empty string if status is None, which is fine
                return obj.building.get_status_display() or None
        except (AttributeError, TypeError, Exception):
            pass
        return None
    
    def get_address(self, obj):
        return self._get_building_field(obj, 'address')
    
    def get_construction_year(self, obj):
        return self._get_building_field(obj, 'construction_year')
    
    def get_quota(self, obj):
        return self._get_building_field(obj, 'quota')
    
    def get_furnishing(self, obj):
        return self._get_building_field(obj, 'furnishing')
    
    def get_distance_from_location_to_BTS_or_MRT(self, obj):
        return self._get_building_field(obj, 'distance_from_location_to_BTS_or_MRT')
    
    def get_distance_from_location_to_ARL(self, obj):
        return self._get_building_field(obj, 'distance_from_location_to_ARL')
    
    def get_have_freehold(self, obj):
        return self._get_building_field(obj, 'have_freehold', False)
    
    def get_have_leasehold(self, obj):
        return self._get_building_field(obj, 'have_leasehold', False)
    
    def get_have_infinity_pool(self, obj):
        return self._get_building_field(obj, 'have_infinity_pool', False)
    
    def get_have_pets_allowed(self, obj):
        return self._get_building_field(obj, 'have_pets_allowed', False)
    
    def get_have_guard_house(self, obj):
        return self._get_building_field(obj, 'have_guard_house', False)
    
    def get_have_sauna(self, obj):
        return self._get_building_field(obj, 'have_sauna', False)
    
    def get_have_sky_lounge(self, obj):
        return self._get_building_field(obj, 'have_sky_lounge', False)
    
    def get_have_grocery(self, obj):
        return self._get_building_field(obj, 'have_grocery', False)
    
    def get_have_fitness_area(self, obj):
        return self._get_building_field(obj, 'have_fitness_area', False)
    
    def get_facility_view(self, obj):
        return self._get_building_field(obj, 'facility_view')
    
    def get_location_view(self, obj):
        return self._get_building_field(obj, 'location_view')
    
    def get_view(self, obj):
        return self._get_building_field(obj, 'view')

    def to_representation(self, instance):
        """Override to catch any serialization errors and return a safe representation"""
        try:
            return super().to_representation(instance)
        except Exception as e:
            logger.error(f"Error serializing property {instance.id if instance else 'None'}: {str(e)}", exc_info=True)
            # Return a minimal safe representation
            return {
                "id": instance.id if instance else None,
                "title": instance.title if instance else "Unknown Property",
                "error": "Failed to load property details"
            }

    class Meta:
        model = Property
        fields = [
            "id",
            "title",
            "price",
            "price_per_sqm",
            "number_of_bedroom",
            "number_of_bathroom",
            "number_of_balcony",
            "number_of_car_parking",
            "balcony_direction",
            "main_door_direction",
            "unit_position",
            "have_vacant",
            "have_tenant_occupied",
            "have_owner_occupied",
            "have_bathtub",
            "have_duplex",
            "building_id",
            "building_title",
            "building_type",
            "building_sub_type",
            "building_status",
            "address",
            "construction_year",
            "quota",
            "furnishing",
            "distance_from_location_to_BTS_or_MRT",
            "distance_from_location_to_ARL",
            "have_freehold",
            "have_leasehold",
            "have_infinity_pool",
            "have_pets_allowed",
            "have_guard_house",
            "have_sauna",
            "have_sky_lounge",
            "have_grocery",
            "have_fitness_area",
            "default_image",
            "interior_view",
            "ariel_view",
            "facility_view",
            "location_view",
            "view",
            "unit_area",
        ]
