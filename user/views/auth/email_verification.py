from django.contrib.auth.decorators import login_required
from django.shortcuts import render
from django.http import JsonResponse
from utils.general_func import blur_email
from user.models import ConfirmationCode


@login_required
def email_verification(request):
    user_email = blur_email(request.user.email)
    try:
        ConfirmationCode.objects.send_confirmation_code(request, request.user, "account_verification")
    except Exception as e:
        print(e)
        return JsonResponse({'status': 'Error', 'message': 'something went wrong try again later'}, status=400)
    return render(request, "auth/email_verification.html", {"email": user_email})
