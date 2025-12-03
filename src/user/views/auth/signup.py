from django.contrib import auth
from django.shortcuts import render, redirect
from django.views import View
from django.urls import reverse
from urllib.parse import urlparse

from user.forms.auth import SignupForm


def is_safe_url(url, allowed_hosts=None):
    """
    Validate that a URL is safe for redirects (prevents open redirects).
    Only allows relative URLs for security.
    """
    if not url:
        return False
    
    # Only allow relative URLs (starting with /)
    # This is the safest approach and avoids ALLOWED_HOSTS pattern matching issues
    if url.startswith('/'):
        return True
    
    # Reject all absolute URLs for security
    return False


class SignupView(View):
    form_class = SignupForm
    template_name = "auth/signup.html"

    def get(self, request):
        if request.user.is_authenticated:
            # Support ?next= redirect for authenticated users
            next_url = request.GET.get('next')
            if next_url and is_safe_url(next_url):
                return redirect(next_url)
            return redirect("dashboard")
        form = self.form_class()
        return render(request, self.template_name, {"signup_form": form})

    def post(self, request):
        if request.user.is_authenticated:
            # Support ?next= redirect for authenticated users
            next_url = request.GET.get('next')
            if next_url and is_safe_url(next_url):
                return redirect(next_url)
            return redirect("dashboard")
        form = self.form_class(request.POST)
        system_error = ""

        if form.is_valid():
            try:
                user = form.save()
                auth.login(request, user)
                
                # Support ?next= redirect after successful signup
                next_url = request.GET.get('next')
                if next_url and is_safe_url(next_url):
                    return redirect(next_url)
                
                # Default redirect to email verification
                return redirect("user:email_verify")
            except Exception as e:
                print("e=======", e)
                system_error = "Something went wrong"

        return render(request, self.template_name, {"signup_form": form, "system_error": system_error})
