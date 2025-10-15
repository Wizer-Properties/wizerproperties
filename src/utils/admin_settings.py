from django.core.exceptions import ObjectDoesNotExist
from core.models import AdminSettings


def get_admin_settings():
    """Get the admin settings instance, create one if it doesn't exist"""
    try:
        settings = AdminSettings.objects.first()
        if not settings:
            settings = AdminSettings.objects.create()
        return settings
    except Exception:
        return AdminSettings.objects.create()


def get_discount_property_cost():
    """Get the cost for creating a discount property"""
    settings = get_admin_settings()
    return settings.discount_property_cost


def get_featured_property_cost():
    """Get the cost for creating a featured property"""
    settings = get_admin_settings()
    return settings.featured_property_cost
