from django.core.mail import EmailMultiAlternatives
from django.conf import settings
from django.template.loader import render_to_string


def send_email(subject, to_email, html_content, text_content="", context={}):
    from_email = settings.FROM_EMAIL
    msg = EmailMultiAlternatives(
        subject, text_content, 
        from_email, [to_email,],
    )
    
    html_content = render_to_string('user/forgot_password_email_template.html', context) 

    msg.attach_alternative(html_content, "text/html")
    msg.send()
