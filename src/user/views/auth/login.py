from typing import TYPE_CHECKING, Any
from django.shortcuts import render, redirect
from django.http import JsonResponse, HttpResponse
from django.contrib import auth

if TYPE_CHECKING:
    from django.http import HttpRequest


def login(request: "HttpRequest") -> "HttpResponse":
    if request.user.is_authenticated:
        return redirect("dashboard")
    
    if request.method == "GET":
        return render(request, "auth/login.html")
 
    if request.method == "POST":
        email: Any = request.POST.get("email")
        password: Any = request.POST.get("password")

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
            return JsonResponse({"message": "Invalid email or password "}, status=401)

    return JsonResponse({"message": "Invalid request method"}, status=405)
