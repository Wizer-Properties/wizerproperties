"""
Django template tags for SEO utilities
Makes it easy to use SEO functions in templates
"""

from typing import Any
from django import template
from django.utils.safestring import SafeString
from utils.seo import (
    generate_organization_schema,
    generate_property_schema,
    generate_article_schema,
    generate_breadcrumb_schema,
    generate_building_schema
)

register = template.Library()


@register.simple_tag
def organization_schema() -> SafeString:
    """Generate organization schema markup"""
    return generate_organization_schema()


@register.simple_tag
def property_schema(property_obj: Any) -> SafeString:
    """Generate property schema markup"""
    return generate_property_schema(property_obj)


@register.simple_tag
def building_schema(building_obj: Any) -> SafeString:
    """Generate building schema markup"""
    return generate_building_schema(building_obj)


@register.simple_tag
def article_schema(article_obj: Any) -> SafeString:
    """Generate article schema markup"""
    return generate_article_schema(article_obj)


@register.simple_tag
def breadcrumb_schema(breadcrumbs: list[tuple[str, str]]) -> SafeString:
    """Generate breadcrumb schema markup
    
    Usage:
        {% breadcrumb_schema breadcrumbs %}
    where breadcrumbs is a list of tuples: [('Home', '/'), ('Properties', '/property/search/')]
    """
    return generate_breadcrumb_schema(breadcrumbs)

