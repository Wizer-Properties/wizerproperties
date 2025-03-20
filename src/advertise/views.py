from django.shortcuts import render
from django.contrib.auth.decorators import login_required
from property.models import Property
from utils.user_required import developer_or_agent_required

@login_required
def handle_reels(request, action_type, reel_id=None):
    properties = Property.objects.filter(is_active=True, created_by=request.user)
    context = {
        "action_type": action_type,
        "reel_id": reel_id,
        "properties": properties,
    }
    return render(request, "create-edit-reels.html", context)


@login_required
def create_reels(request):
    return handle_reels(request, "create")


@login_required
def edit_reels(request, id):
    return handle_reels(request, "edit", id)


@developer_or_agent_required
def advertise_analytics(request):
    return render(request, "advertise-analytics.html")


@developer_or_agent_required
def advertise_performance(request):
    return render(request, "advertise-performance.html")



def reels(request):
    return render(request, "reels.html")