from django.db.models import Q, Count
from django.contrib.auth.decorators import login_required
from django.contrib import messages
from django.shortcuts import render, redirect
from django.urls import reverse
from django.utils import timezone
from building.models import Building, BuildingReview
from property.models import Property, CompareProperty, DiscountProperty, FeatureProperty
from schedule.models import VisitingSchedule


@login_required
def dashboard(request):
    """Route users to their respective dashboards based on user type."""
    if request.user.user_type == "developer" or request.user.user_type == "agent":
        to_return = developer_or_agent_dashboard(request)
    elif request.user.user_type == "prospect":
        to_return = prospect_dashboard(request)
    elif request.user.is_superuser or request.user.is_staff:
        to_return = redirect(reverse("admin:index"))
    else:
        # Default fallback: redirect to home or show error
        # This handles edge cases where user_type is None or unexpected value
        messages.warning(request, "Unable to determine dashboard. Please complete your profile.")
        to_return = redirect("/")

    return to_return


@login_required
def developer_or_agent_dashboard(request):
    buildings = Building.objects.filter(created_by=request.user).order_by("-created_at")
    properties = Property.objects.filter(created_by=request.user).order_by("-created_at")
    
    # Get discount and featured properties
    discount_properties = DiscountProperty.objects.filter(created_by=request.user).select_related('property', 'property__building').order_by('period')
    featured_properties = FeatureProperty.objects.filter(created_by=request.user).select_related('property', 'property__building').order_by('expiry_date')

    building_counts = buildings.aggregate(total=Count("id"), active=Count("id", filter=Q(is_active=True)))
    property_counts = properties.aggregate(total=Count("id"), active=Count("id", filter=Q(is_active=True)))
    
    # Count discount and featured properties
    discount_count = discount_properties.count()
    featured_count = featured_properties.count()

    context = {
        "buildings": buildings,
        "properties": properties,
        "discount_properties": discount_properties[:5],
        "featured_properties": featured_properties[:5],
        "total_buildings": building_counts["total"],
        "active_buildings_count": building_counts["active"],
        "total_properties": property_counts["total"],
        "active_properties_count": property_counts["active"],
        "total_discount_properties": discount_count,
        "total_featured_properties": featured_count,
        "today": timezone.now().date(),
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
