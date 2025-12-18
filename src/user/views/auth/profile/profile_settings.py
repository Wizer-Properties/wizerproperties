from typing import TYPE_CHECKING, Any
from django.contrib.auth.decorators import login_required
from django.shortcuts import render, redirect
from django.urls import reverse

if TYPE_CHECKING:
    from django.http import HttpRequest, HttpResponse


@login_required
def profile_settings(request: "HttpRequest") -> "HttpResponse":
    user = request.user
    if not user.is_authenticated:
        return redirect("login")
    if user.user_type in ("developer", "agent"):
        to_return = developer_or_agent_profile_settings(request)
    elif user.user_type == "prospect":
        to_return = prospect_profile_settings(request)
    elif user.is_superuser or user.is_staff:
        to_return = redirect(reverse("admin:index"))
    else:
        to_return = redirect(reverse("dashboard"))

    return to_return


@login_required
def developer_or_agent_profile_settings(request: "HttpRequest") -> "HttpResponse":
    user = request.user
    if not user.is_authenticated:
        return redirect("login")
    profile: Any = None
    if user.user_type == "developer":
        profile = getattr(user, "developerprofile", None)
    elif user.user_type == "agent":
        profile = getattr(user, "agentprofile", None)
    
    return render(request, "auth/profile/developer_or_agent_profile_settings.html", {"profile": profile})


@login_required
def prospect_profile_settings(request: "HttpRequest") -> "HttpResponse":
    user = request.user
    if not user.is_authenticated:
        return redirect("login")
    profile = getattr(user, "prospectprofile", None)
    return render(request, "auth/profile/prospect_profile_settings.html", {"profile": profile})
