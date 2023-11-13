from django.db.models import Q, Count
from django.contrib.auth.decorators import login_required
from django.shortcuts import render, redirect
from django.urls import reverse
from building.models import Building, BuildingReview
from property.models import Property, CompareProperty
from schedule.models import VisitingSchedule


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
    total_comparisons = CompareProperty.objects.filter(user=request.user).count()
    total_reviews = BuildingReview.objects.filter(user=request.user).count()
    schedules = VisitingSchedule.objects.filter(prospect=request.user.prospectprofile).order_by("-created_at")

    schedule_counts = schedules.aggregate(total=Count("id"), accepted=Count("id", filter=Q(status="accepted")))

    context = {
        "total_comparisons": total_comparisons,
        "total_reviews": total_reviews,
        "total_schedules": schedule_counts["total"],
        "total_accepted_schedules": schedule_counts["accepted"],
    }
    return render(request, "core/prospect_dashboard.html", context)
