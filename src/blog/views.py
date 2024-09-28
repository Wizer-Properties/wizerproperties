from django.shortcuts import render
from .models import Category, Post


def blog_list(request):
    categories = Category.objects.filter(is_active=True)
    return render(request, "blog-list.html", {"categories": categories})


def blog_details(request, slug):
    
    # Get the post or redirect to 404 if not found
    try:
        post = Post.objects.prefetch_related('categories', 'creator').get(slug=slug)
        post.total_read_count += 1
        post.save()
    except Post.DoesNotExist:
        return render(request, '404.html', status=404)
    
    return render(request, "blog-details.html", {"post": post})
