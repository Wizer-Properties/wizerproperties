from django.shortcuts import render, get_object_or_404
from django.contrib.auth.decorators import login_required
from building.models import Building
from .models import Property


def prepare_property_context(request, id=None):
    property = get_object_or_404(Property, pk=id) if id else None
    images = property.media_files.filter(type="image") if property else []
    videos = property.media_files.filter(type="video") if property else []
    context = {
        "property": property,
        "images": images,
        "videos": videos,
    }
    return context


@login_required
def create_property(request):
    context = prepare_property_context(request)
    context["buildings"] = Building.objects.filter(is_active=True, created_by=request.user)
    return render(request, "create_property.html", context)


def get_property(request, id):
    context = prepare_property_context(request, id)
    context["buildings"] = Building.objects.filter(is_active=True)
    return render(request, "get_property.html", context)


@login_required
def update_property(request, id):
    context = prepare_property_context(request, id)
    context["buildings"] = Building.objects.filter(is_active=True, created_by=request.user)
    return render(request, "update_property.html", context)


def search_property(request):
    return render(request, "search_property.html")


@login_required
def comparison_property(request):
    return render(request, "comparison.html")


@login_required
def favorite_list(request):
    return render(request, "favorite-list.html")


@login_required
def dev_agent_property_list(request):
    if request.user.user_type == "developer":
        profile = request.user.developerprofile
    elif request.user.user_type == "agent":
        profile = request.user.agentprofile
    else:
        profile = None
    return render(request, "developer-agent-property-list.html", {"profile": profile})