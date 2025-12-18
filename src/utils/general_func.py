import requests
import os
import datetime
from datetime import timedelta
from typing import Any, Dict, List, Optional, Union, TYPE_CHECKING
from django.utils import timezone
from django.core.mail import EmailMultiAlternatives
from django.conf import settings
from django.core.exceptions import ValidationError
from django.template.loader import render_to_string
from openai import OpenAI
from ipdata.models import IPData
from utils.admin_settings import get_openai_api_key

if TYPE_CHECKING:
    from django.http import HttpRequest


def send_email(subject: str, to_email: str, html_content: str, text_content: str = "", context: Optional[Dict[str, Any]] = None) -> None:
    """
    Send an HTML email with optional text fallback.
    
    Args:
        subject: Email subject line.
        to_email: Recipient email address.
        html_content: Path to HTML template for email body.
        text_content: Plain text version of email (optional).
        context: Dictionary of template variables for rendering HTML content.
    
    Note:
        Uses Django's EmailMultiAlternatives to send both HTML and text versions.
        The FROM_EMAIL is taken from Django settings.
    """
    if context is None:
        context = {}
    from_email = settings.FROM_EMAIL
    msg = EmailMultiAlternatives(
        subject,
        text_content,
        from_email,
        [
            to_email,
        ],
    )

    html_content = render_to_string(html_content, context)

    msg.attach_alternative(html_content, "text/html")
    msg.send()


def blur_email(email: str) -> str:
    """
    Blur email address for privacy by masking most characters.
    
    Args:
        email: The email address to blur.
    
    Returns:
        str: Blurred email address (e.g., "ex*******@gmail.com").
            Returns original email if format is invalid.
    
    Example:
        >>> blur_email("example@gmail.com")
        'ex*******@gmail.com'
    """
    parts = email.split("@")

    if len(parts) == 2:
        username, domain = parts
        visible_chars = 2
        blurred_username = username[:visible_chars] + "*" * (len(username) - visible_chars)
        return blurred_username + "@" + domain
    else:
        return email


def show_custom_error_message(fields: Dict[str, Any]) -> None:
    """
    Override default serializer error messages with custom formatted messages.
    
    Args:
        fields: Dictionary of serializer fields to update error messages for.
    """
    # Override default serializers error
    for field in fields:
        # iterate over the serializer fields
        fields[field].error_messages["required"] = (
            "%s field is required" % field.replace("_obj", " ").replace("_", " ").title()
        )
        fields[field].error_messages["invalid"] = (
            "%s is not valid" % field.replace("_obj", " ").replace("_", " ").title()
        )
        fields[field].error_messages["blank"] = (
            "%s field is blank" % field.replace("_obj", " ").replace("_", " ").title()
        )


def validate_media_file_extension(value: Any, allowed_extensions: List[str]) -> None:
    """
    Validate that a media file has an allowed extension.
    
    Args:
        value: The file field value to validate.
        allowed_extensions: List of allowed file extensions (e.g., ['jpg', 'png', 'pdf']).
    
    Raises:
        ValidationError: If the file extension is not in the allowed list.
    """
    if value:
        ext = value.name.split(".")[-1].lower()
        if ext not in allowed_extensions:
            raise ValidationError(f"Unsupported file format. Supported formats: {', '.join(allowed_extensions)}")


def rename_dict_key(data_dict: Dict[str, Any], key_list: List[List[str]]) -> Dict[str, Any]:
    """
    Filters dict data by keys
+
        Parameters:
            data_dict (dict) : Dict data
            key_list (list) : List of keys \
                (e.g: [["key", "modified_key"], ["key", "modified_key"]])
+
        Returns:
            Updated dict data
    """
    for key in key_list:
        if key[0] in data_dict:
            data_dict[key[1]] = data_dict.pop(key[0])

    return data_dict


def validate_date_format(value: str) -> None:
    """
    Validate that a date string is in the format mm/dd/yyyy.
    
    Args:
        value: Date string to validate.
    
    Raises:
        ValidationError: If the date format is invalid.
    """
    try:
        # Try to parse the value as a date in the expected format
        datetime.datetime.strptime(value, "%m/%d/%Y")
    except ValueError:
        raise ValidationError("Invalid date format. Use mm/dd/yyyy.")


def get_chatgpt_response(content: str, previous_response: Optional[str] = None) -> str:
    """
    Return generated message response using OpenRouter AI based on the provided 'content'.
    
    Args:
        content: User's message content to send to AI.
        previous_response: Optional previous response for conversation context.
    
    Returns:
        str: AI-generated response message, or error message if API call fails.
    """
    try:
        # Get OpenRouter API key from admin settings
        api_key = get_openai_api_key()
        
        if not api_key:
            return "OpenRouter API key is not configured in admin settings."
        
        # Initialize OpenAI client configured for OpenRouter
        client = OpenAI(
            base_url="https://openrouter.ai/api/v1",
            api_key=api_key,
        )
        
        messages: List[Dict[str, str]] = []
        if previous_response:
            messages.append({"role": "system", "content": previous_response})
        messages.append({"role": "user", "content": content})

        # Using OpenAI GPT-4o-mini via OpenRouter for cost-effective responses
        # Note: openrouter/auto doesn't support all features, so using specific model
        # Alternative: Can use openai/gpt-3.5-turbo for even lower cost
        response = client.chat.completions.create(
            model="openai/gpt-4o-mini",  # Cost-effective model via OpenRouter
            messages=messages, # type: ignore
        )
        return str(response.choices[0].message.content)
    except Exception as e:
        return "I'm having trouble connecting right now. Please try again in a moment. I want to help you get the information you need."


def get_user_ip(request: "HttpRequest") -> str:
    """
    Extract the user's IP address from the request.
    
    Args:
        request: Django HttpRequest object.
    
    Returns:
        str: User's IP address, checking X-Forwarded-For header first, then REMOTE_ADDR.
    """
    x_forwarded_for = request.META.get("HTTP_X_FORWARDED_FOR")

    if x_forwarded_for:
        ip = str(x_forwarded_for).split(",")[0]
    else:
        ip = str(request.META.get("REMOTE_ADDR"))

    return ip


def get_user_location(request: "HttpRequest") -> Optional[str]:
    """
    Get user's location based on IP address using proxycheck.io API.
    
    Args:
        request: Django HttpRequest object.
    
    Returns:
        dict: Dictionary containing location information (country, region, city, address),
            or None if location cannot be determined.
    """
    ip = get_user_ip(request)

    if not ip:
        return None
    
    ip_data_obj, created = IPData.objects.get_or_create(ip=ip)
    
    has_proxycheck_time_passed = False
    if ip_data_obj.last_time_checked_by_proxycheck:
        expected_time_interval = timezone.now() - timedelta(days=settings.PROXYCHECK_REQUEST_TIME_INTERVEL)
        if expected_time_interval > ip_data_obj.last_time_checked_by_proxycheck:
            has_proxycheck_time_passed = True
    else:
        has_proxycheck_time_passed = True
    
    if has_proxycheck_time_passed:
        if settings.PROXYCHECK_API_KEY:
            response =requests.get('https://proxycheck.io/v2/{ip}?key={key}?vpn=1&asn=1'.format(ip=ip, key=settings.PROXYCHECK_API_KEY))
        else:
            response = requests.get('https://proxycheck.io/v2/{ip}?vpn=1&asn=1'.format(ip=ip))

        ip_data_obj.last_time_checked_by_proxycheck = timezone.now()
        ip_details = response.json()
        api_key_status = ip_details['status']
        
        country, region, city = "", "", ""

        if api_key_status == 'error':
            return None
        else:
            details = ip_details.get(ip, {})
            if 'country' in details:
                country = details['country']
            if 'region' in details:
                region = details['region']
            if 'city' in details:
                city = details['city']
        
            address = ""
            if city:
                address += city
            if region:
                address += f", {region}"
            if country:
                address += f", {country}"
        
        ip_data_obj.address = address
        ip_data_obj.save()
        
    return str(ip_data_obj.address) if ip_data_obj.address else None


def get_duration_without_milliseconds(duration: Union[timedelta, str, Any]) -> str:
    """
    Format duration to remove microseconds and keep the format `days hours:minutes:seconds`.
    
    Args:
        duration: timedelta object or other duration value.
    
    Returns:
        str: Formatted duration string (e.g., "1 02:30:45" or "02:30:45").
    """
    # Format duration to remove microseconds and keep the format `days hours:minutes:seconds`

    if isinstance(duration, timedelta):
        total_seconds = int(duration.total_seconds())
        days, remainder = divmod(total_seconds, 86400)
        hours, remainder = divmod(remainder, 3600)
        minutes, seconds = divmod(remainder, 60)
        if days > 0:
            return f"{days} {hours:02}:{minutes:02}:{seconds:02}"
        else:
            return f"{hours:02}:{minutes:02}:{seconds:02}"

    return str(duration)



def formatted_number(value: Any) -> str:
    """
    Format number with comma separators for thousands.
    
    Args:
        value: Numeric value to format (int, float, or string representation).
    
    Returns:
        str: Formatted number string (e.g., "234,234,234" or "234,234,234.50").
            Returns empty string if value is None.
    
    Example:
        >>> formatted_number(234234234)
        '234,234,234'
    """
    if value is None:
        return ""
    
    parts = str(value).split('.')
    integer_part = parts[0]
    
    # Add commas to integer part
    integer_part = "{:,}".format(int(integer_part))
    
    # Combine with decimal part if it exists and is not all zeros
    if len(parts) > 1 and parts[1].strip('0'):
        formatted = integer_part + '.' + parts[1]
    else:
        formatted = integer_part
    
    return formatted