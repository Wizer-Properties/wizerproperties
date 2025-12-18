from typing import Any, Optional, TYPE_CHECKING, cast
from django.shortcuts import render
from django.contrib.auth.decorators import login_required
from property.models import Property
from user.models import User
from utils.user_required import developer_or_agent_required

if TYPE_CHECKING:
    from django.http import HttpRequest, HttpResponse

@login_required
def handle_reels(request: "HttpRequest", action_type: str, reel_id: Optional[int] = None) -> "HttpResponse":
    user = cast(User, request.user)
    properties = Property.objects.filter(is_active=True, created_by=user)
    context = {
        "action_type": action_type,
        "reel_id": reel_id,
        "properties": properties,
    }
    return render(request, "create-edit-reels.html", context)


@login_required
def create_reels(request: "HttpRequest") -> "HttpResponse":
    return handle_reels(request, "create")


@login_required
def edit_reels(request: "HttpRequest", id: int) -> "HttpResponse":
    return handle_reels(request, "edit", id)


@developer_or_agent_required
def advertise_analytics(request: "HttpRequest") -> "HttpResponse":
    return render(request, "advertise-analytics.html")


@developer_or_agent_required
def advertise_performance(request: "HttpRequest") -> "HttpResponse":
    return render(request, "advertise-performance.html")



def reels(request: "HttpRequest") -> "HttpResponse":
    return render(request, "reels.html")