from typing import Any, TYPE_CHECKING, cast
from collections.abc import Callable
from functools import wraps
from django.shortcuts import redirect
from django.conf import settings
from django.contrib import messages

if TYPE_CHECKING:
    from django.http import HttpRequest, HttpResponse


def prospect_profile_required(view_func: Callable[..., Any]) -> Callable[..., Any]:
    @wraps(view_func)
    def _wrapped_view(request: "HttpRequest", *args: Any, **kwargs: Any) -> "HttpResponse":
        if not request.user.is_authenticated:
            from django.contrib.auth.views import redirect_to_login
            return redirect_to_login(request.get_full_path())
        if not hasattr(request.user, "prospectprofile"):
            messages.error(
                request,
                "Booking requires a buyer account. This account is registered as a developer/agent.",
            )
            return redirect("/")
        return cast("HttpResponse", view_func(request, *args, **kwargs))

    return _wrapped_view
