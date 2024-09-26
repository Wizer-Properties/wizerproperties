from django.shortcuts import render
from .models import Category


def blog_list(request):
    categories = Category.objects.filter(is_active=True)
    return render(request, "blog-list.html", {"categories": categories})


def blog_details(request, title):
    return render(request, "blog-details.html")