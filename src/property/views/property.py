import ast
from django.shortcuts import render, get_object_or_404
from django.contrib.auth.decorators import login_required
from django.conf import settings
from django.utils import timezone
from django.urls import reverse
from building.models import Building
from property.models import Property
from user.models import User, Profile, DeveloperProfile, AgentProfile
from advertise.models import Advertisement
from utils.general_func import get_user_location


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
    property = get_object_or_404(Property, pk=id)
    
    """When people visit a property, we are storing that user's location and gender"""
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

    # If this property is visited through AD then we are creating some log on that AD
    if request.GET.get("ad_id", None):
        ad_obj = Advertisement.objects.filter(id=request.GET.get("ad_id")).first()
        if ad_obj:        
            ad_obj.manage_ad_analytics(user, location)  # Updating ad analytics value
    
    property.manage_property_analytics(user, location)  # Updating property analytics value

    # Check if 'discounted=True' is in the URL
    is_discounted = request.GET.get('discounted', False)
    if is_discounted:
        # Increasing the number_of_clicked for the associated DiscountProperty
        discount_property = property.discounts.first()
        today = timezone.now().date()
        if discount_property and discount_property.period >= today:
            discount_property.increase_total_view_count()
    
    # Check if 'featured=True' is in the URL
    is_featured = request.GET.get('featured', False)
    if is_featured:
        # Increasing the number_of_clicked for the associated FeatureProperty
        feature_property = property.features.first()
        if feature_property:
            feature_property.increase_total_view_count()

    """Storing search related cookie"""
    context = prepare_property_context(request, id)
    context["buildings"] = Building.objects.filter(is_active=True)
    property_obj = context["property"]
    
    # Add breadcrumbs for structured data
    context["breadcrumbs"] = [
        ('Home', '/'),
        ('Properties', reverse('property:search')),
        (property_obj.building.title or 'Building', reverse('building:get', args=[property_obj.building.id])),
        (property_obj.title or 'Property', property_obj.get_absolute_url()),
    ]
    
    response = render(request, "get_property.html", context)
    property = property_obj
    
    searched_places = request.COOKIES.get('searched_places')
    if searched_places:
        searched_places = ast.literal_eval(searched_places)
    else:
        searched_places = []

    place = {
        "building__province": property.building.province,
        "building__district": property.building.district,
        "building__sub_district": property.building.sub_district,
    }

    # Add place at the beginning of the list
    if place in searched_places:
        searched_places.remove(place)
    searched_places.insert(0, place)
    # Limit the list to only five elements
    searched_places = searched_places[:5]
    response.set_cookie("searched_places", searched_places, settings.COOKIE_EXPIRE_TIME)

    return response


@login_required
def update_property(request, id):
    context = prepare_property_context(request, id)
    context["buildings"] = Building.objects.filter(is_active=True, created_by=request.user)
    return render(request, "update_property.html", context)


def search_property(request):
    # List view - always return list view template
    return render(request, "search_property.html")

def search_property_with_map(request):
    # Map view endpoint (for explicit map view access)
    return render(request, "search_property_with_map.html")

def comparison_property(request):
    """
    Comparison page - accessible to all users.
    Authentication is handled at the API level when adding/removing properties.
    """
    return render(request, "comparison.html")


@login_required
def favorite_list(request):
    return render(request, "favorite-list.html")


def dev_agent_property_list(request, id):
    user = get_object_or_404(User, id=id) if id else None

    developer_profile = DeveloperProfile.objects.filter(user_id=user.id).first()
    agent_profile = AgentProfile.objects.filter(user_id=user.id).first()
    company_info = {}

    if developer_profile:
        company_info["company_name"] = developer_profile.company_name
        company_info["address"] = developer_profile.address
        company_info["company_details"] = developer_profile.company_details
        company_info["phone_number"] = developer_profile.phone_number
        company_info["company_logo"] = developer_profile.company_logo.url if developer_profile.company_logo else None

    if agent_profile:
        company_info["company_name"] = agent_profile.company_name
        company_info["address"] = agent_profile.address
        company_info["company_details"] = agent_profile.company_details
        company_info["phone_number"] = agent_profile.phone_number
        company_info["company_logo"] = agent_profile.company_logo.url if agent_profile.company_logo else None

    context = {"user_id": user.id, "username": user.username, "email": user.email, "company_info": company_info}

    return render(request, "developer-agent-property-list.html", context)
