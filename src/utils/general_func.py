import requests
import os
from datetime import timedelta
from django.utils import timezone
from django.core.mail import EmailMultiAlternatives
from django.conf import settings
from django.core.exceptions import ValidationError
from django.template.loader import render_to_string
from openai import OpenAI
from ipdata.models import IPData
from utils.admin_settings import get_openai_api_key


def send_email(subject, to_email, html_content, text_content="", context={}):
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


def blur_email(email):
    # Avoid to show full email. Return the email like "ex*******@gmail.com"
    parts = email.split("@")

    if len(parts) == 2:
        username, domain = parts
        visible_chars = 2
        blurred_username = username[:visible_chars] + "*" * (len(username) - visible_chars)
        return blurred_username + "@" + domain
    else:
        return email


def show_custom_error_message(fields):
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


def validate_media_file_extension(value, allowed_extensions):
    if value:
        ext = value.name.split(".")[-1].lower()
        if ext not in allowed_extensions:
            raise ValidationError(f"Unsupported file format. Supported formats: {', '.join(allowed_extensions)}")


def rename_dict_key(data_dict: dict, key_list: list) -> dict:
    """
    Filters dict data by keys

        Parameters:
            data_dict (dict) : Dict data
            key_list (list) : List of keys \
                (e.g: [["key", "modified_key"], ["key", "modified_key"]])

        Returns:
            Updated dict data
    """
    for key in key_list:
        if key[0] in data_dict:
            data_dict[key[1]] = data_dict.pop(key[0])

    return data_dict


def validate_date_format(value):
    try:
        # Try to parse the value as a date in the expected format
        timezone.datetime.strptime(value, "%m/%d/%Y")
    except ValueError:
        raise ValidationError("Invalid date format. Use mm/dd/yyyy.")


def get_chatgpt_response(content, previous_response=None):
    """
    Return generated message response using ChatGPT based on the provided 'content'.
    """
    try:
        # Get OpenAI API key from admin settings
        api_key = get_openai_api_key()
        
        if not api_key:
            return "OpenAI API key is not configured in admin settings."
        
        # Set the API key in environment for this request
        os.environ["OPENAI_API_KEY"] = api_key
        
        client = OpenAI()
        messages = []
        if previous_response:
            messages.append({"role": "system", "content": previous_response})
        messages.append({"role": "user", "content": content})

        response = client.chat.completions.create(
            model="gpt-3.5-turbo",
            messages=messages,
        )
        return response.choices[0].message.content
    except Exception as e:
        return "I'm having trouble connecting right now. Please try again in a moment—I want to help you get the information you need."


def get_user_ip(request):
    x_forwarded_for = request.META.get("HTTP_X_FORWARDED_FOR")

    if x_forwarded_for:
        ip = x_forwarded_for.split(",")[0]
    else:
        ip = request.META.get("REMOTE_ADDR")

    return ip


def get_user_location(request):
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
            if 'country' in ip_details[ip]:
                country = ip_details[ip]['country']
            if 'region' in ip_details[ip]:
                region = ip_details[ip]['region']
            if 'city' in ip_details[ip]:
                city = ip_details[ip]['city']
        
            address = ""
            if city:
                address += city
            if region:
                address += f", {region}"
            if country:
                address += f", {country}"
        
        ip_data_obj.address = address
        ip_data_obj.save()
        
    return ip_data_obj.address


def get_duration_without_milliseconds(duration):
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

    return duration



def formatted_number(value):
    """
    Formatted number returning a string, eg 234234234 convert to 234,234,234
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