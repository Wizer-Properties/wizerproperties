from typing import Optional
from django.core.exceptions import ObjectDoesNotExist
from core.models import AdminSettings


def get_admin_settings() -> AdminSettings:
    """
    Get the admin settings instance, create one if it doesn't exist.
    
    Returns:
        AdminSettings: The admin settings instance. If multiple records exist,
            prefers one with an API key, otherwise returns the most recently updated.
    
    Note:
        This function implements a singleton pattern to ensure only one AdminSettings
        record is used. If multiple records exist, it will log a warning and attempt
        to select the most appropriate one.
    """
    try:
        count = AdminSettings.objects.count()
        
        if count == 0:
            # No records exist, create one
            return AdminSettings.objects.create()
        elif count == 1:
            # Single record, return it
            return AdminSettings.objects.first()
        else:
            # Multiple records exist - prefer one with API key, or most recent
            import logging
            logger = logging.getLogger(__name__)
            logger.warning(f"Multiple AdminSettings records found ({count}). Attempting to find the correct one.")
            
            # Try to find a record with an API key first
            settings_with_key = AdminSettings.objects.exclude(
                openai_api_key__isnull=True
            ).exclude(
                openai_api_key=''
            ).exclude(
                openai_api_key__exact=''
            ).first()
            
            if settings_with_key:
                logger.info(f"Found AdminSettings record with API key (ID: {settings_with_key.id}). Using it.")
                return settings_with_key
            
            # If no record has API key, use the most recently updated one
            settings = AdminSettings.objects.order_by('-updated_at').first()
            logger.warning(f"No AdminSettings record with API key found. Using most recently updated record (ID: {settings.id}). Please configure API key and delete duplicates.")
            return settings
            
    except Exception as e:
        import logging
        logger = logging.getLogger(__name__)
        logger.exception(f"Error getting AdminSettings: {e}")
        return AdminSettings.objects.create()


def get_discount_property_cost() -> float:
    """
    Get the cost for creating a discount property.
    
    Returns:
        float: The credit cost required to create a discount property listing.
    """
    settings = get_admin_settings()
    return float(settings.discount_property_cost)


def get_featured_property_cost() -> float:
    """
    Get the cost for creating a featured property.
    
    Returns:
        float: The credit cost required to create a featured property listing.
    """
    settings = get_admin_settings()
    return float(settings.featured_property_cost)


def get_openai_api_key() -> str:
    """
    Get the OpenRouter API key from admin settings.
    
    Returns:
        str: The OpenRouter API key, or empty string if not configured.
            Whitespace is automatically stripped from the key.
    """
    try:
        settings = get_admin_settings()
        api_key = settings.openai_api_key
        if api_key:
            # Strip whitespace and return if not empty
            api_key = api_key.strip()
            return api_key if api_key else ""
        return ""
    except Exception as e:
        import logging
        logger = logging.getLogger(__name__)
        logger.exception(f"Error retrieving OpenRouter API key: {e}")
        return ""
