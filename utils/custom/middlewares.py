from django.conf import settings
from django.shortcuts import redirect
from django.urls import reverse


class CustomMiddleware:
    def __init__(self, get_response):
        self.get_response = get_response

    def __call__(self, request):
        # List of URLs to skip both email verification and profile completion checks
        skip_urls = [
            reverse("account_verify"),
            reverse("logout"),
            reverse("api:developer-list"),
            reverse("api:agent-list"),
            reverse("api:prospect-list"),
            "/media/",
        ]

        # Check if the user is authenticated and not superuser not on a skip URL
        if (
            request.user.is_authenticated
            and not request.user.is_superuser
            and not request.user.is_staff
            and request.path not in skip_urls
            and request.path[:7] not in [settings.MEDIA_URL, "/admin/"]
        ):
            # Check email verification status
            if not request.user.email_verification_status and not request.path == reverse("email_verify"):
                # Redirect the user to the email verification page
                return redirect(reverse("email_verify"))

            # Check profile completion (only if email verification is complete)
            elif (
                request.user.email_verification_status
                and not request.user.is_complete_profile
                and not request.path == reverse("profile")
            ):
                # Redirect the user to the profile completion page
                return redirect(reverse("profile"))

        response = self.get_response(request)
        return response
