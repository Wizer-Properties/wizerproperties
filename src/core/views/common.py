from typing import TYPE_CHECKING
from django.shortcuts import render

if TYPE_CHECKING:
    from django.http import HttpRequest, HttpResponse

def home_page(request: "HttpRequest") -> "HttpResponse":
    # Check if user is a developer/agent, show developer homepage
    if request.user.is_authenticated and getattr(request.user, 'user_type', None) in ['developer', 'agent']:
        return render(request, "home_developer.html")
    # Default to buyer-focused homepage
    return render(request, "home.html")
    
def developer_home_page(request: "HttpRequest") -> "HttpResponse":
    """Developer-focused homepage"""
    return render(request, "home_developer.html")

def developer_pricing_page(request: "HttpRequest") -> "HttpResponse":
    """Developer pricing page"""
    return render(request, "developers_pricing.html")

def contact_page(request: "HttpRequest") -> "HttpResponse":
    return render(request, "contact_us.html")


def about_us_page(request: "HttpRequest") -> "HttpResponse":
    return render(request, "about-us.html")


def privacy_page(request: "HttpRequest") -> "HttpResponse":
    return render(request, "privacy.html")


def custom_404(request: "HttpRequest") -> "HttpResponse":
    return render(request, "404.html")
