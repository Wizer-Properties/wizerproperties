from django.shortcuts import render
from django.contrib.auth.decorators import login_required


@login_required
def create_building(request):
    return render(request, "create_building.html")


@login_required
def get_building(request):
    return render(request, "get_building.html")
