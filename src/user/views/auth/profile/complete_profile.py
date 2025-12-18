from typing import TYPE_CHECKING
from django.contrib.auth.decorators import login_required
from django.shortcuts import redirect, render
from django.urls import reverse

if TYPE_CHECKING:
    from django.http import HttpRequest, HttpResponse


@login_required
def complete_profile(request: "HttpRequest") -> "HttpResponse":
    """
    Handle profile completion flow for authenticated users.
    
    Args:
        request: Django HttpRequest object with authenticated user.
    
    Returns:
        HttpResponse: Redirect to admin for staff/superuser, or render profile completion page.
    """
    user = request.user
    if not user.is_authenticated:
        return redirect("login")
    
    to_return: "HttpResponse" = redirect("/")

    # Check if the user has a complete profile.
    if not user.is_complete_profile:
        # If the user is a superuser or staff, redirect them to the admin index page.
        if user.is_superuser or user.is_staff:
            to_return = redirect(reverse("admin:index"))
        else:
            to_return = render(request, "auth/complete_profile.html")   

    return to_return


@login_required
def complete_developer_profile(request: "HttpRequest") -> "HttpResponse":
    return render(request, "auth/profile/complete_developer_profile.html")


@login_required
def complete_agent_profile(request: "HttpRequest") -> "HttpResponse":
    return render(request, "auth/profile/complete_agent_profile.html")


@login_required
def complete_prospect_profile(request: "HttpRequest") -> "HttpResponse":
    return render(request, "auth/profile/complete_prospect_profile.html")
