from django.contrib.auth.decorators import login_required
from django.shortcuts import redirect, render
from django.urls import reverse


@login_required
def profile(request):
    to_return = redirect("/")

    # Check if the user has a complete profile.
    if not request.user.is_complete_profile:
        # Depending on the user's user_type, redirect to their specific profile page.
        if request.user.user_type == "developer":
            to_return = developer_profile(request)
        elif request.user.user_type == "agent":
            to_return = agent_profile(request)
        elif request.user.user_type == "prospect":
            to_return = prospect_profile(request)
        # If the user is a superuser or staff, redirect them to the admin index page.
        elif request.user.is_superuser or request.user.is_staff:
            to_return = redirect(reverse("admin:index"))

    return to_return


@login_required
def developer_profile(request):
    return render(request, "auth/profile/developer.html")


@login_required
def agent_profile(request):
    return render(request, "auth/profile/agent.html")


@login_required
def prospect_profile(request):
    return render(request, "auth/profile/prospect.html")
