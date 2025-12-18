from typing import Any, TYPE_CHECKING, cast
from collections.abc import Callable
from functools import wraps
from django.shortcuts import redirect
from django.conf import settings

if TYPE_CHECKING:
    from django.http import HttpRequest, HttpResponse


def prospect_profile_required(view_func: Callable[..., Any]) -> Callable[..., Any]:
    @wraps(view_func)
    def _wrapped_view(request: "HttpRequest", *args: Any, **kwargs: Any) -> "HttpResponse":
        if not request.user.is_authenticated or not hasattr(request.user, "prospectprofile"):
            return redirect(settings.LOGIN_URL)
        return cast("HttpResponse", view_func(request, *args, **kwargs))

    return _wrapped_view
