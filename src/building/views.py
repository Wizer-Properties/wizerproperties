from django.shortcuts import render, get_object_or_404
from django.contrib.auth.decorators import login_required
from building.models import Building


@login_required
def create_building(request):
    return render(request, "create_building.html")


@login_required
def update_building(request, id):
    building = get_object_or_404(Building, pk=id)
    images = building.media_files.filter(type="image")
    floor_plans = building.media_files.filter(type="floor_plan")
    unit_floor_plans = building.media_files.filter(type="unit_floor_plan")
    master_plans = building.media_files.filter(type="master_plan")
    videos = building.media_files.filter(type="video")
    context = {
        "building": building,
        "images": images,
        "floor_plans": floor_plans,
        "unit_floor_plans": unit_floor_plans,
        "master_plans": master_plans,
        "videos": videos,
    }
    return render(request, "update_building.html", context)
