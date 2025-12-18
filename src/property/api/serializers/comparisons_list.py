from rest_framework import serializers
from property.models import Property
import logging
from typing import Any, Dict, List, Optional, Union, TYPE_CHECKING
from urllib.parse import urlparse

if TYPE_CHECKING:
    _Base = serializers.ModelSerializer[Property]
else:
    _Base = serializers.ModelSerializer

logger = logging.getLogger(__name__)


class PropertyComparisonsListSerializer(_Base):
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
    interior_view = serializers.URLField(read_only=True, allow_null=True)
    ariel_view = serializers.URLField(source="ariel_video_url", read_only=True, allow_null=True)
    facility_view = serializers.SerializerMethodField()
    location_view = serializers.SerializerMethodField()
    view = serializers.SerializerMethodField()
    
    def _get_building_field(self, obj: Property, field_name: str, default: Any = None) -> Any:
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
    
    def get_building_title(self, obj: Property) -> Any:
        return self._get_building_field(obj, 'title')
    
    def get_building_type(self, obj: Property) -> Any:
        return self._get_building_field(obj, 'type')
    
    def get_building_sub_type(self, obj: Property) -> Optional[str]:
        try:
            if obj.building:
                # get_sub_type_display() is a Django method for choice fields
                # It returns empty string if sub_type is None, which is fine
                return str(obj.building.get_sub_type_display()) or None
        except (AttributeError, TypeError, Exception):
            pass
        return None
    
    def get_building_status(self, obj: Property) -> Optional[str]:
        try:
            if obj.building:
                # get_status_display() is a Django method for choice fields
                # It returns empty string if status is None, which is fine
                return str(obj.building.get_status_display()) or None
        except (AttributeError, TypeError, Exception):
            pass
        return None
    
    def get_address(self, obj: Property) -> Any:
        return self._get_building_field(obj, 'address')
    
    def get_construction_year(self, obj: Property) -> Any:
        return self._get_building_field(obj, 'construction_year')
    
    def get_quota(self, obj: Property) -> Any:
        return self._get_building_field(obj, 'quota')
    
    def get_furnishing(self, obj: Property) -> Any:
        return self._get_building_field(obj, 'furnishing')
    
    def get_distance_from_location_to_BTS_or_MRT(self, obj: Property) -> Any:
        return self._get_building_field(obj, 'distance_from_location_to_BTS_or_MRT')
    
    def get_distance_from_location_to_ARL(self, obj: Property) -> Any:
        return self._get_building_field(obj, 'distance_from_location_to_ARL')
    
    def get_have_freehold(self, obj: Property) -> Any:
        return self._get_building_field(obj, 'have_freehold', False)
    
    def get_have_leasehold(self, obj: Property) -> Any:
        return self._get_building_field(obj, 'have_leasehold', False)
    
    def get_have_infinity_pool(self, obj: Property) -> Any:
        return self._get_building_field(obj, 'have_infinity_pool', False)
    
    def get_have_pets_allowed(self, obj: Property) -> Any:
        return self._get_building_field(obj, 'have_pets_allowed', False)
    
    def get_have_guard_house(self, obj: Property) -> Any:
        return self._get_building_field(obj, 'have_guard_house', False)
    
    def get_have_sauna(self, obj: Property) -> Any:
        return self._get_building_field(obj, 'have_sauna', False)
    
    def get_have_sky_lounge(self, obj: Property) -> Any:
        return self._get_building_field(obj, 'have_sky_lounge', False)
    
    def get_have_grocery(self, obj: Property) -> Any:
        return self._get_building_field(obj, 'have_grocery', False)
    
    def get_have_fitness_area(self, obj: Property) -> Any:
        return self._get_building_field(obj, 'have_fitness_area', False)
    
    def _validate_url(self, url: Any) -> Optional[str]:
        """
        Validate and format URL. Returns None if invalid or empty.
        Ensures URL has a valid protocol (http:// or https://).
        """
        if not url or not isinstance(url, str) or url.strip() == "":
            return None
        
        url = url.strip()
        
        # Parse URL to check if it has a scheme
        parsed = urlparse(url)
        
        # If no scheme, try to add https://
        if not parsed.scheme:
            # If it starts with //, add https:
            if url.startswith("//"):
                url = "https:" + url
            # If it looks like a domain (contains dots and doesn't start with /), add https://
            elif "." in url and not url.startswith("/"):
                url = "https://" + url
            else:
                # Relative URLs or paths are not valid for iframes
                return None
        
        # Re-parse after potential modification
        parsed = urlparse(url)
        
        # Validate: must have http/https scheme and a netloc (domain)
        if parsed.scheme in ("http", "https") and parsed.netloc:
            return str(url)
        
        return None
    
    def get_facility_view(self, obj: Property) -> Optional[str]:
        url = self._get_building_field(obj, 'facility_view')
        return self._validate_url(url)
    
    def get_location_view(self, obj: Property) -> Optional[str]:
        url = self._get_building_field(obj, 'location_view')
        return self._validate_url(url)
    
    def get_view(self, obj: Property) -> Any:
        return self._get_building_field(obj, 'view')

    def to_representation(self, instance: Property) -> Dict[str, Any]:
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
