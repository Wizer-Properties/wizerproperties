from typing import TYPE_CHECKING, Optional, Set, Any
from django.contrib import auth
from django.shortcuts import render, redirect
from django.views import View
from django.urls import reverse
from urllib.parse import urlparse

from user.forms.auth import SignupForm

if TYPE_CHECKING:
    from django.http import HttpRequest, HttpResponse


def is_safe_url(url: Optional[str], allowed_hosts: Optional[Set[str]] = None) -> bool:
    """
    Validate that a URL is safe for redirects (prevents open redirects).
    Only allows relative URLs for security.
    """
    if not url:
        return False
    
    # Parse URL to check for scheme or netloc
    parsed = urlparse(url)
    
    # Reject protocol-relative URLs (//evil.com) and absolute URLs with scheme/netloc
    if parsed.scheme or parsed.netloc or url.startswith('//'):
        return False
    
    # Only allow relative URLs (starting with / but not //)
    if url.startswith('/') and not url.startswith('//'):
        return True
    
    # Reject all other URLs for security
    return False


class SignupView(View):
    form_class = SignupForm
    template_name = "auth/signup.html"

    def get(self, request: "HttpRequest") -> "HttpResponse":
        if request.user.is_authenticated:
            # Support ?next= redirect for authenticated users
            next_url: Any = request.GET.get('next')
            if next_url and is_safe_url(next_url):
                return redirect(str(next_url))
            return redirect("dashboard")
        form = self.form_class()
        return render(request, self.template_name, {"signup_form": form})

    def post(self, request: "HttpRequest") -> "HttpResponse":
        if request.user.is_authenticated:
            # Support ?next= redirect for authenticated users
            next_url: Any = request.GET.get('next')
            if next_url and is_safe_url(next_url):
                return redirect(str(next_url))
            return redirect("dashboard")
        form = self.form_class(request.POST)
        system_error = ""

        if form.is_valid():
            try:
                user = form.save()
                auth.login(request, user)
                
                # Support ?next= redirect after successful signup
                next_url_reg: Any = request.GET.get('next')
                if next_url_reg and is_safe_url(next_url_reg):
                    return redirect(str(next_url_reg))
                
                # Default redirect to email verification
                return redirect("user:email_verify")
            except Exception as e:
                import logging
                logger = logging.getLogger(__name__)
                logger.exception(f"Error during user signup: {e}")
                system_error = "Something went wrong"

        return render(request, self.template_name, {"signup_form": form, "system_error": system_error})
