from typing import Any, Callable, TYPE_CHECKING, cast
from django.contrib.auth.decorators import login_required
from django.shortcuts import redirect
from user.models import DeveloperProfile, AgentProfile

if TYPE_CHECKING:
    from django.http import HttpRequest, HttpResponse

def developer_or_agent_required(view_func: Callable[..., Any]) -> Callable[..., Any]:
    # this decorator allow only developer and agent
    @login_required
    def _wrapped_view(request: "HttpRequest", *args: Any, **kwargs: Any) -> "HttpResponse":
        user = request.user
        if not user.is_authenticated:
            return redirect('login')
        # if user has developer and agent profile
        if DeveloperProfile.objects.filter(user=user).exists() or AgentProfile.objects.filter(user=user).exists():
            return cast("HttpResponse", view_func(request, *args, **kwargs))
        else:
            return redirect('dashboard')
    return _wrapped_view