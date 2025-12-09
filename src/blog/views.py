from django.shortcuts import render
from django.urls import reverse
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
    
    # Is liked by user or Is disliked by user
    if request.user.is_authenticated:
        is_liked = post.interactions.filter(interaction_type='like', user=request.user).exists()
        is_disliked = post.interactions.filter(interaction_type='dislike', user=request.user).exists()
    else:
        is_liked = post.interactions.filter(interaction_type='like', ip_address=request.META.get('REMOTE_ADDR')).exists()
        is_disliked = post.interactions.filter(interaction_type='dislike', ip_address=request.META.get('REMOTE_ADDR')).exists()
    
    # Add breadcrumbs for structured data
    breadcrumbs = [
        ('Home', '/'),
        ('Blog', reverse('blogs:blog_list')),
        (post.title, post.get_absolute_url()),
    ]
    
    context = {
        "post": post,
        "is_liked": "true" if is_liked else "false",
        "is_disliked": "true" if is_disliked else "false",
        "breadcrumbs": breadcrumbs,
    }
    
    return render(request, "blog-details.html", context)
