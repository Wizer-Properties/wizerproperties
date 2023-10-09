from django.contrib.auth.decorators import login_required
from django.shortcuts import redirect, render
from django.urls import reverse


@login_required
def complete_profile(request):
    to_return = redirect("/")

    # Check if the user has a complete profile.
    if not request.user.is_complete_profile:
        # Depending on the user's user_type, redirect to their specific profile page.
        if request.user.user_type == "developer":
            to_return = complete_developer_profile(request)
        elif request.user.user_type == "agent":
            to_return = complete_agent_profile(request)
        elif request.user.user_type == "prospect":
            to_return = complete_prospect_profile(request)
        # If the user is a superuser or staff, redirect them to the admin index page.
        elif request.user.is_superuser or request.user.is_staff:
            to_return = redirect(reverse("admin:index"))

    return to_return


@login_required
def complete_developer_profile(request):
    return render(request, "auth/profile/complete_developer_profile.html")


@login_required
def complete_agent_profile(request):
    return render(request, "auth/profile/complete_agent_profile.html")


@login_required
def complete_prospect_profile(request):
    return render(request, "auth/profile/complete_prospect_profile.html")
