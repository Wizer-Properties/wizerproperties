from django.utils import timezone
from django.core.mail import EmailMultiAlternatives
from django.conf import settings
from django.core.exceptions import ValidationError
from django.template.loader import render_to_string


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
