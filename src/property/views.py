import ast
from django.shortcuts import render, get_object_or_404
from django.contrib.auth.decorators import login_required
from django.conf import settings
from building.models import Building
from .models import Property
from user.models import User, Profile, DeveloperProfile, AgentProfile

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
    response = render(request, "get_property.html", context)
    property = context["property"]
    
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
    response.set_cookie("number_of_bedroom", property.number_of_bedroom, settings.COOKIE_EXPIRE_TIME)
    response.set_cookie("number_of_bathroom", property.number_of_bathroom, settings.COOKIE_EXPIRE_TIME)

    return response


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




def dev_agent_property_list(request, id):
    user = get_object_or_404(User, id=id) if id else None

    developer_profile = DeveloperProfile.objects.filter(user_id=user.id).first()
    agent_profile = AgentProfile.objects.filter(user_id=user.id).first()
    company_info = {}

    if developer_profile:
        company_info['company_name'] = developer_profile.company_name
        company_info['company_address'] = developer_profile.company_address
        company_info['company_details'] = developer_profile.company_details
        company_info['phone_number'] = developer_profile.phone_number
        company_info['company_logo'] = developer_profile.company_logo.url if developer_profile.company_logo else None

    if agent_profile:
        company_info['company_name'] = agent_profile.company_name
        company_info['company_address'] = agent_profile.company_address
        company_info['company_details'] = agent_profile.company_details
        company_info['phone_number'] = agent_profile.phone_number
        company_info['company_logo'] = agent_profile.company_logo.url if agent_profile.company_logo else None


    context = {
        'user_id' : user.id,
        'username': user.username,
        'email': user.email,
        'company_info' : company_info
    }

    return render(request, "developer-agent-property-list.html" , context)