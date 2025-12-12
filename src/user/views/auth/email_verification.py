from django.contrib.auth.decorators import login_required
from django.shortcuts import render
from django.http import JsonResponse
from utils.general_func import blur_email
from user.models import ConfirmationCode


@login_required
def email_verification(request):
    user_email = blur_email(request.user.email)
    context = {}
    try:
        ConfirmationCode.objects.send_confirmation_code(request, request.user, "account_verification")
        context["status"] = "success"
        context["message"] = f"We have sent you a verification code to your email ({user_email}). Please check your email and verify your account."
    except Exception as e:
        import logging
        logger = logging.getLogger(__name__)
        logger.exception(f"Email verification error for {user_email}: {e}")
        context["status"] = "error"
        context["message"] = f"Something went wrong. Could not send ({user_email}) verification code. Please try again later."
    return render(request, "auth/email_verification.html", context)
