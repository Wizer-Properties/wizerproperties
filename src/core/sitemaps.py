"""
Sitemap generation for Wizer Properties
Generates XML sitemaps for all public pages
"""

from django.contrib.sitemaps import Sitemap
from django.urls import reverse
from property.models import Property
from blog.models import Post
from building.models import Building
from django.utils import timezone


class StaticViewSitemap(Sitemap):
    """Sitemap for static pages"""
    priority = 1.0
    changefreq = 'monthly'

    def items(self):
        return [
            'home',
            'contact',
            'about-us',
            'privacy',
            'property:search',
            'blogs:blog_list',
            'reels',
        ]

    def location(self, item):
        return reverse(item)


class PropertySitemap(Sitemap):
    """Sitemap for property listings"""
    changefreq = 'weekly'
    priority = 0.8

    def items(self):
        # Only include active properties
        return Property.objects.filter(is_active=True).order_by('-updated_at')

    def lastmod(self, obj):
        return obj.updated_at

    def location(self, obj):
        return reverse('property:get', args=[obj.id])


class BlogPostSitemap(Sitemap):
    """Sitemap for blog posts"""
    changefreq = 'monthly'
    priority = 0.7

    def items(self):
        # Only include published posts
        return Post.objects.filter(status='published').order_by('-updated_at')

    def lastmod(self, obj):
        return obj.updated_at

    def location(self, obj):
        return reverse('blogs:blog_details', args=[obj.slug])


class BuildingSitemap(Sitemap):
    """Sitemap for building/project pages"""
    changefreq = 'monthly'
    priority = 0.6

    def items(self):
        # Only include active buildings
        return Building.objects.filter(is_active=True).order_by('-updated_at')

    def lastmod(self, obj):
        return obj.updated_at

    def location(self, obj):
        return reverse('building:get', args=[obj.id])

