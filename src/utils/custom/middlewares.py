from typing import Any, TYPE_CHECKING
from collections.abc import Callable
from django.conf import settings
from django.shortcuts import redirect
from django.urls import reverse

if TYPE_CHECKING:
    from django.http import HttpRequest, HttpResponse

class CustomMiddleware:
    get_response: Callable[["HttpRequest"], "HttpResponse"]

    def __init__(self, get_response: Callable[["HttpRequest"], "HttpResponse"]) -> None:
        self.get_response = get_response

    def __call__(self, request: "HttpRequest") -> "HttpResponse":
        # List of URLs to skip both email verification and profile completion checks
        skip_urls: list[str] = [
            reverse("user:logout"),
            reverse("user:email_verify"),
            reverse("user:password_reset_verify"),  # Updated to new primary name
            reverse("user:forgot_password_verify"),  # Keep legacy for compatibility
            reverse("user:api:developer_create"),
            reverse("user:api:agent_create"),
            reverse("user:api:prospect_create"),
            "/media/",
        ]

        # Check if the user is authenticated and not superuser not on a skip URL
        if (
            request.user.is_authenticated
            and not request.user.is_superuser
            and not request.user.is_staff
            and request.path not in skip_urls
            and not (settings.MEDIA_URL and request.path.startswith(settings.MEDIA_URL))
            and not request.path.startswith("/admin/")
        ):
            # Check email verification status
            verify_link_paths: list[str] = [
                reverse("user:verify_link"),
                reverse("user:verify_link_alt"),  # Include alternative path
            ]
            if not request.user.email_verification_status and request.path not in verify_link_paths:
                # Redirect the user to the email verification page
                return redirect(reverse("user:email_verify"))

            # Check profile completion (only if email verification is complete)
            complete_profile_paths: list[str] = [
                reverse("user:complete_profile"),
                reverse("user:complete_profile_alt"),  # Include alternative path
            ]
            if (
                request.user.email_verification_status
                and not request.user.is_complete_profile
                and request.path not in complete_profile_paths
            ):
                # Redirect the user to the profile completion page
                return redirect(reverse("user:complete_profile"))

        response = self.get_response(request)
        return response
