from django.shortcuts import render, get_object_or_404
from django.contrib.auth.decorators import login_required
from building.models import Building
from advertise.models import Advertisement
from utils.general_data import COMMERCIAL_SUB_TYPES, RESIDENCE_SUB_TYPES
from utils.general_func import get_user_location


def prepare_building_context(building):
    images = building.media_files.filter(type="image")
    unit_floor_plans = building.media_files.filter(type="unit_floor_plan")
    master_plans = building.media_files.filter(type="master_plan")
    videos = building.media_files.filter(type="video")
    aerial_drone_videos = building.media_files.filter(type="aerial_drone_video")
    context = {
        "building": building,
        "images": images,
        "unit_floor_plans": unit_floor_plans,
        "master_plans": master_plans,
        "videos": videos,
        "aerial_drone_videos": aerial_drone_videos,
    }
    return context


@login_required
def create_building(request):
    context = {
        "residence_sub_types": dict(RESIDENCE_SUB_TYPES),
        "commercial_sub_types": dict(COMMERCIAL_SUB_TYPES),
    }
    return render(request, "create_building.html", context)


def get_building(request, id):
    building = get_object_or_404(Building, pk=id)

    """When people visit a building, we are storing that user's location and gender"""
    user = None
    location = None
    if request.user.is_authenticated:
        user = request.user
        if hasattr(user, "developerprofile"):
            location = user.developerprofile.address
        elif hasattr(user, "agentprofile"):
            location = user.agentprofile.address
        elif hasattr(user, "prospectprofile"):
            location = user.prospectprofile.address
    else:
        location = get_user_location(request)

    # If this building is visited through AD then we are creating some log on that AD
    if request.GET.get("ad_id", None):
        ad_obj = Advertisement.objects.filter(id=request.GET.get("ad_id")).first()
        if ad_obj:        
            ad_obj.manage_ad_analytics(user, location)  # Updating ad analytics value

    context = prepare_building_context(building)
    return render(request, "get_building.html", context)


@login_required
def update_building(request, id):
    building = get_object_or_404(Building, pk=id)
    context = prepare_building_context(building)
    context["residence_sub_types"] = dict(RESIDENCE_SUB_TYPES)
    context["commercial_sub_types"] = dict(COMMERCIAL_SUB_TYPES)
    return render(request, "update_building.html", context)
