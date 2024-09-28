from django.shortcuts import render

def home_page(request):
    return render(request, "home.html")
    

def contact_page(request):
    return render(request, "contact_us.html")


def about_us_page(request):
    return render(request, "about-us.html")


def privacy_page(request):
    return render(request, "privacy.html")


def custom_404(request):
    return render(request, "404.html")
