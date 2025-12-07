from django.shortcuts import render

def home_page(request):
    # Check if user is a developer/agent, show developer homepage
    if request.user.is_authenticated and request.user.user_type in ['developer', 'agent']:
        return render(request, "home_developer.html")
    # Default to buyer-focused homepage
    return render(request, "home.html")
    
def developer_home_page(request):
    """Developer-focused homepage"""
    return render(request, "home_developer.html")

def developer_pricing_page(request):
    """Developer pricing page"""
    return render(request, "developers_pricing.html")

def contact_page(request):
    return render(request, "contact_us.html")


def about_us_page(request):
    return render(request, "about-us.html")


def privacy_page(request):
    return render(request, "privacy.html")


def custom_404(request):
    return render(request, "404.html")
