"""
Sitemap generation for Wizer Properties
Generates XML sitemaps for all public pages
"""

from typing import TYPE_CHECKING
from django.contrib.sitemaps import Sitemap
from django.urls import reverse
from property.models import Property
from blog.models import Post
from building.models import Building
from django.utils import timezone

if TYPE_CHECKING:
    from django.db.models import QuerySet
    import datetime


class StaticViewSitemap(Sitemap): # type: ignore[type-arg]
    """Sitemap for static pages"""
    priority = 1.0
    changefreq = 'monthly'

    def items(self) -> list[str]:
        return [
            'home',
            'contact',
            'about-us',
            'privacy',
            'property:search',
            'blogs:blog_list',
            'reels',
        ]

    def location(self, item: str) -> str:
        return reverse(item)


class PropertySitemap(Sitemap): # type: ignore[type-arg]
    """Sitemap for property listings"""
    changefreq = 'weekly'
    priority = 0.8

    def items(self) -> "QuerySet[Property]":
        # Only include active properties
        return Property.objects.filter(is_active=True).order_by('-updated_at')

    def lastmod(self, obj: Property) -> "datetime.datetime":
        return obj.updated_at

    def location(self, obj: Property) -> str:
        return reverse('property:get', args=[obj.id])


class BlogPostSitemap(Sitemap): # type: ignore[type-arg]
    """Sitemap for blog posts"""
    changefreq = 'monthly'
    priority = 0.7

    def items(self) -> "QuerySet[Post]":
        # Only include published posts
        return Post.objects.filter(status='published').order_by('-updated_at')

    def lastmod(self, obj: Post) -> "datetime.datetime":
        return obj.updated_at

    def location(self, obj: Post) -> str:
        return reverse('blogs:blog_details', args=[obj.slug])


class BuildingSitemap(Sitemap): # type: ignore[type-arg]
    """Sitemap for building/project pages"""
    changefreq = 'monthly'
    priority = 0.6

    def items(self) -> "QuerySet[Building]":
        # Only include active buildings
        return Building.objects.filter(is_active=True).order_by('-updated_at')

    def lastmod(self, obj: Building) -> "datetime.datetime":
        return obj.updated_at

    def location(self, obj: Building) -> str:
        return reverse('building:get', args=[obj.id])

