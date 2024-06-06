from django.shortcuts import render, get_object_or_404
from django.contrib.auth.decorators import login_required
from building.models import Building
from utils.general_data import COMMERCIAL_SUB_TYPES, RESIDENCE_SUB_TYPES


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
    context = prepare_building_context(building)
    return render(request, "get_building.html", context)


@login_required
def update_building(request, id):
    building = get_object_or_404(Building, pk=id)
    context = prepare_building_context(building)
    context["residence_sub_types"] = dict(RESIDENCE_SUB_TYPES)
    context["commercial_sub_types"] = dict(COMMERCIAL_SUB_TYPES)
    return render(request, "update_building.html", context)
