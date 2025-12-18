from typing import TYPE_CHECKING
from django.shortcuts import render
from django.contrib.auth.decorators import login_required
from utils.custom.decorators import prospect_profile_required

if TYPE_CHECKING:
    from django.http import HttpRequest, HttpResponse


@login_required
@prospect_profile_required
def create_schedule(request: "HttpRequest") -> "HttpResponse":
    return render(request, "create_schedule.html")
