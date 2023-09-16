from django.contrib.auth.decorators import login_required
from django.shortcuts import render
from utils.general_func import blur_email, send_email_verificaton_link


@login_required
def email_verification(request):
    user_email = blur_email(request.user.email)
    send_email_verificaton_link(request.user)
    return render(request, "auth/email_verification.html", {"email": user_email})
