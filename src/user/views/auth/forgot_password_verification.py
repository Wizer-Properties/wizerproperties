from django.shortcuts import render


def forgot_password_verification(request):
    return render(request, "auth/forgot_password_verification.html")
