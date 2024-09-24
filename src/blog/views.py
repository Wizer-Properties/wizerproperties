from django.shortcuts import render

# Create your views here.

def blog_list(request):
    return render(request, "blog-list.html")


def blog_details(request, title):
    return render(request, "blog-details.html")