from typing import Any, TYPE_CHECKING, cast
from django.shortcuts import render, get_object_or_404
from django.contrib.auth.decorators import login_required
from django.urls import reverse
from building.models import Building
from user.models import User
from advertise.models import Advertisement
from utils.general_data import COMMERCIAL_SUB_TYPES, RESIDENCE_SUB_TYPES
from utils.general_func import get_user_location

if TYPE_CHECKING:
    from django.http import HttpRequest, HttpResponse


def prepare_building_context(building: Building) -> dict[str, Any]:
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
def create_building(request: "HttpRequest") -> "HttpResponse":
    context = {
        "residence_sub_types": dict(RESIDENCE_SUB_TYPES),
        "commercial_sub_types": dict(COMMERCIAL_SUB_TYPES),
    }
    return render(request, "create_building.html", context)


def get_building(request: "HttpRequest", id: int) -> "HttpResponse":
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
    ad_id_raw = request.GET.get("ad_id", None)
    if ad_id_raw:
        try:
            ad_obj = Advertisement.objects.filter(id=int(ad_id_raw)).first()
            if ad_obj:        
                ad_obj.manage_ad_analytics(user, location)  # Updating ad analytics value
        except (ValueError, TypeError):
            pass

    context = prepare_building_context(building)
    
    # Add breadcrumbs for structured data
    context["breadcrumbs"] = [
        ('Home', '/'),
        ('Properties', reverse('property:search')),
        (building.title or 'Building', building.get_absolute_url()),
    ]
    
    return render(request, "get_building.html", context)


@login_required
def update_building(request: "HttpRequest", id: int) -> "HttpResponse":
    building = get_object_or_404(Building, pk=id)
    context = prepare_building_context(building)
    context["residence_sub_types"] = dict(RESIDENCE_SUB_TYPES)
    context["commercial_sub_types"] = dict(COMMERCIAL_SUB_TYPES)
    return render(request, "update_building.html", context)
