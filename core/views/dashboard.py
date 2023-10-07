from django.contrib.auth.decorators import login_required
from django.shortcuts import render, redirect
from django.urls import reverse


@login_required
def dashboard(request):
    if request.user.user_type == "developer" or request.user.user_type == "agent":
        to_return = developer_or_agent_dashboard(request)
    elif request.user.user_type == "prospect":
        to_return = prospect_dashboard(request)
    elif request.user.is_superuser or request.user.is_staff:
        to_return = redirect(reverse("admin:index"))

    return to_return


@login_required
def developer_or_agent_dashboard(request):
    return render(request, "core/developer_or_agent_dashboard.html")


@login_required
def prospect_dashboard(request):
    return render(request, "core/prospect_dashboard.html")
