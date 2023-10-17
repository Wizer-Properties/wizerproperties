from django.shortcuts import render, get_object_or_404
from django.contrib.auth.decorators import login_required
from building.models import Building
from .models import Property


@login_required
def create_property(request):
    buildings = Building.objects.filter(created_by=request.user)
    return render(request, "create_property.html", {"buildings": buildings})


@login_required
def update_property(request, id):
    property = get_object_or_404(Property, pk=id)
    images = property.media_files.filter(type="image")
    unit_floor_plans = property.media_files.filter(type="unit_floor_plan")
    videos = property.media_files.filter(type="video")
    buildings = Building.objects.filter(created_by=request.user)
    context = {
        "buildings": buildings,
        "property": property,
        "images": images,
        "unit_floor_plans": unit_floor_plans,
        "videos": videos,
    }
    return render(request, "update_property.html", context)
