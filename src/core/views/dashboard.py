from django.db.models import Q, Count
from django.contrib.auth.decorators import login_required
from django.shortcuts import render, redirect
from django.urls import reverse
from building.models import Building
from property.models import Property


@login_required
def dashboard(request):
    if request.user.user_type == "developer" or request.user.user_type == "agent":
        to_return = developer_or_agent_dashboard(request)
    elif request.user.user_type == "prospect":
        to_return = prospect_dashboard(request)
    elif request.user.is_superuser or request.user.is_staff:
        to_return = redirect(reverse("admin:index"))

    return to_return


@login_required
def developer_or_agent_dashboard(request):
    buildings = Building.objects.filter(created_by=request.user).order_by("-created_at")
    properties = Property.objects.filter(created_by=request.user).order_by("-created_at")

    building_counts = buildings.aggregate(total=Count("id"), active=Count("id", filter=Q(is_active=True)))
    property_counts = properties.aggregate(total=Count("id"), active=Count("id", filter=Q(is_active=True)))

    context = {
        "buildings": buildings,
        "properties": properties,
        "total_buildings": building_counts["total"],
        "active_buildings_count": building_counts["active"],
        "total_properties": property_counts["total"],
        "active_properties_count": property_counts["active"],
    }
    return render(request, "core/developer_or_agent_dashboard.html", context)


@login_required
def prospect_dashboard(request):
    return render(request, "core/prospect_dashboard.html")
