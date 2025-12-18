from typing import TYPE_CHECKING
from django.shortcuts import render

if TYPE_CHECKING:
    from django.http import HttpRequest, HttpResponse


def forgot_password_verification(request: "HttpRequest") -> "HttpResponse":
    return render(request, "auth/forgot_password_verification.html")
