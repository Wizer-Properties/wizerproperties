from django.core.mail import EmailMultiAlternatives
from django.conf import settings


def send_email(subject, to_email, html_content, text_content=""):
    from_email = settings.FROM_EMAIL
    msg = EmailMultiAlternatives(
        subject, text_content, 
        from_email, [to_email,],
    )

    msg.attach_alternative(html_content, "text/html")
    msg.send()
