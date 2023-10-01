import secrets
from django.core.mail import EmailMultiAlternatives
from django.conf import settings
from django.template.loader import render_to_string
from user.models.auth import ConfirmationCode


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


def send_email_verificaton_link(user):
    # Create account verification code and send email for verification
    code = ConfirmationCode.objects.create(user=user, code_type="account_verification", code=secrets.token_hex(3))

    send_email(
        subject="Verify Your Account",
        to_email=user.email,
        html_content="email/account_verification.html",
        context={"site_host": settings.SITE_HOST, "token": code.code},
    )


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
