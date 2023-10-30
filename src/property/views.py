from django.shortcuts import render, get_object_or_404
from django.contrib.auth.decorators import login_required
from building.models import Building
from .models import Property


def prepare_property_context(request, id=None):
    buildings = Building.objects.filter(created_by=request.user)
    property = get_object_or_404(Property, pk=id) if id else None
    images = property.media_files.filter(type="image") if property else []
    videos = property.media_files.filter(type="video") if property else []
    context = {
        "buildings": buildings,
        "property": property,
        "images": images,
        "videos": videos,
    }
    return context


@login_required
def create_property(request):
    context = prepare_property_context(request)
    return render(request, "create_property.html", context)


def get_property(request, id):
    context = prepare_property_context(request, id)
    return render(request, "get_property.html", context)


@login_required
def update_property(request, id):
    context = prepare_property_context(request, id)
    return render(request, "update_property.html", context)


def search_property(request):
    return render(request, "search_property.html")
