from django.shortcuts import render


def create_property(request):
    return render(request, 'create_property.html')
