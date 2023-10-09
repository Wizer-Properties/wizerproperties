from django.contrib.auth.decorators import login_required
from django.shortcuts import render, redirect
from django.urls import reverse


@login_required
def profile_settings(request):
    if request.user.user_type == "developer" or request.user.user_type == "agent":
        to_return = developer_or_agent_profile_settings(request)
    elif request.user.user_type == "prospect":
        to_return = prospect_profile_settings(request)
    elif request.user.is_superuser or request.user.is_staff:
        to_return = redirect(reverse("admin:index"))

    return to_return


@login_required
def developer_or_agent_profile_settings(request):
    return render(request, "auth/profile/developer_or_agent_profile_settings.html")


@login_required
def prospect_profile_settings(request):
    return render(request, "auth/profile/prospect_profile_settings.html")
