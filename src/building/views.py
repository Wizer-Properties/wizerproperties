from django.shortcuts import render


def create_building(request):
    return render(request, 'create_building.html')
