from django.shortcuts import render
from django.contrib.auth.decorators import login_required
from utils.custom.decorators import prospect_profile_required


@login_required
@prospect_profile_required
def create_schedule(request):
    return render(request, "create_schedule.html")
