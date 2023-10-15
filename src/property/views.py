from django.shortcuts import render
from django.contrib.auth.decorators import login_required
from building.models import Building


@login_required
def create_property(request):
    buildings = Building.objects.filter(created_by=request.user)
    return render(request, "create_property.html", {"buildings": buildings})


@login_required
def get_property(request):
    return render(request, "get_property.html")
