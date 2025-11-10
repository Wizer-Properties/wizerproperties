from django.contrib.auth.decorators import login_required
from django.shortcuts import render, redirect
from django.urls import reverse


@login_required
def profile_settings(request):
    if request.user.user_type in ("developer", "agent"):
        to_return = developer_or_agent_profile_settings(request)
    elif request.user.user_type == "prospect":
        to_return = prospect_profile_settings(request)
    elif request.user.is_superuser or request.user.is_staff:
        to_return = redirect(reverse("admin:index"))
    else:
        to_return = redirect(reverse("dashboard"))

    return to_return


@login_required
def developer_or_agent_profile_settings(request):
    if request.user.user_type == "developer":
        profile = request.user.developerprofile
    elif request.user.user_type == "agent":
        profile = request.user.agentprofile
    else:
        profile = None
    return render(request, "auth/profile/developer_or_agent_profile_settings.html", {"profile": profile})


@login_required
def prospect_profile_settings(request):
    profile = request.user.prospectprofile
    return render(request, "auth/profile/prospect_profile_settings.html", {"profile": profile})
