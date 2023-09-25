from django.conf import settings
from django.shortcuts import redirect
from django.urls import reverse


class CustomMiddleware:
    def __init__(self, get_response):
        self.get_response = get_response

    def __call__(self, request):
        # List of URLs to skip both email verification and profile completion checks
        skip_urls = [
            reverse("user:logout"),
            reverse("user:email_verify"),
            reverse("user:api:developer-list"),
            reverse("user:api:agent-list"),
            reverse("user:api:prospect-list"),
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
            if not request.user.email_verification_status and not request.path == reverse("user:verify_link"):
                # Redirect the user to the email verification page
                return redirect(reverse("user:email_verify"))

            # Check profile completion (only if email verification is complete)
            elif (
                request.user.email_verification_status
                and not request.user.is_complete_profile
                and not request.path == reverse("user:profile")
            ):
                # Redirect the user to the profile completion page
                return redirect(reverse("user:profile"))

        response = self.get_response(request)
        return response
