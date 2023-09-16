from django.shortcuts import render, redirect
from django.http import JsonResponse
from django.contrib import auth


def login(request):
    if request.user.is_authenticated:
        return redirect("/")
    
    if request.method == "GET":
        return render(request, "auth/login.html")

    if request.method == "POST":
        email = request.POST.get("email")
        password = request.POST.get("password")

        # Authenticate using the email and password
        user = auth.authenticate(request, email=email, password=password)

        if user is not None:
            auth.login(request, user)
            return JsonResponse({"message": "Login successful"}, status=200)
        else:
            return JsonResponse({"message": "Invalid email or password "}, status=401)

    return JsonResponse({"message": "Invalid request method"}, status=405)
