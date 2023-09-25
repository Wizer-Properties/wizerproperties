from django.core.mail import EmailMultiAlternatives
from django.conf import settings
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
        blurred_username = username[0] + "*" * (len(username) - 2) + username[-1]
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
