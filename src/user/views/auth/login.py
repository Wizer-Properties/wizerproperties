from typing import TYPE_CHECKING, Optional
from django.shortcuts import render, redirect
from django.http import JsonResponse, HttpResponse
from django.contrib import auth
from user.forms import LoginForm

if TYPE_CHECKING:
    from django.http import HttpRequest


def login(request: "HttpRequest") -> "HttpResponse":
    if request.user.is_authenticated:
        return redirect("dashboard")
    
    if request.method == "GET":
        return render(request, "auth/login.html")
 
    if request.method == "POST":
        form = LoginForm(request.POST)
        if not form.is_valid():
            return JsonResponse({"message": "Invalid email or password", "errors": form.errors}, status=401)

        email: Optional[str] = form.cleaned_data.get("email")
        password: Optional[str] = form.cleaned_data.get("password")

        # Authenticate using the email and password
        user = auth.authenticate(request, email=email, password=password)

        if user is not None:
            auth.login(request, user)
            return JsonResponse({
                "message": "Login successful",
                "user_id": user.id,
                "user_type": getattr(user, 'user_type', 'prospect')
            }, status=200)
        else:
            return JsonResponse({"message": "Invalid email or password"}, status=401)

    return JsonResponse({"message": "Invalid request method"}, status=405)
