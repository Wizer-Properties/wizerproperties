from django.contrib.auth.decorators import login_required
from django.shortcuts import redirect, render
from django.urls import reverse


@login_required
def complete_profile(request):
    """
    Handle profile completion flow for authenticated users.
    
    Args:
        request: Django HttpRequest object with authenticated user.
    
    Returns:
        HttpResponse: Redirect to admin for staff/superuser, or render profile completion page.
    """
    to_return = redirect("/")

    # Check if the user has a complete profile.
    if not request.user.is_complete_profile:
        # If the user is a superuser or staff, redirect them to the admin index page.
        if request.user.is_superuser or request.user.is_staff:
            to_return = redirect(reverse("admin:index"))
        else:
            to_return = render(request, "auth/complete_profile.html")   

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
