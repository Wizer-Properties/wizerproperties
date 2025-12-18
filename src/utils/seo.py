from typing import Any, Optional
from django.conf import settings
from django.utils.html import format_html, escape
from django.utils.safestring import mark_safe, SafeString
import json


def get_site_url() -> str:
    """Get the base site URL"""
    return str(getattr(settings, 'SITE_HOST', 'https://wizerproperties.com'))


def generate_meta_tags(title: str, description: str, keywords: Optional[str] = None, 
                      image: Optional[str] = None, url: Optional[str] = None, 
                      og_type: str = 'website', **kwargs: Any) -> SafeString:
    """
    Generate comprehensive SEO meta tags
    
    Args:
        title: Page title (50-60 chars recommended)
        description: Meta description (150-160 chars recommended)
        keywords: Comma-separated keywords (optional)
        image: Open Graph image URL (optional)
        url: Canonical URL (optional, defaults to current page)
        og_type: Open Graph type (website, article, product, etc.)
        **kwargs: Additional meta tags (author, robots, etc.)
    
    Returns:
        HTML string with meta tags
    """
    site_url = get_site_url()
    if not url:
        url = site_url
    
    if not image:
        image = f"{site_url}/static/media/logo.png"
    
    tags = []
    
    # Basic meta tags
    tags.append(f'<meta charset="UTF-8">')
    tags.append(f'<meta name="viewport" content="width=device-width, initial-scale=1">')
    tags.append(f'<title>{escape(title)}</title>')
    tags.append(f'<meta name="description" content="{escape(description)}">')
    
    if keywords:
        tags.append(f'<meta name="keywords" content="{escape(keywords)}">')
    
    # Canonical URL
    tags.append(f'<link rel="canonical" href="{escape(url)}">')
    
    # Open Graph tags
    tags.append(f'<meta property="og:type" content="{og_type}">')
    tags.append(f'<meta property="og:title" content="{escape(title)}">')
    tags.append(f'<meta property="og:description" content="{escape(description)}">')
    tags.append(f'<meta property="og:url" content="{escape(url)}">')
    tags.append(f'<meta property="og:image" content="{escape(image)}">')
    tags.append(f'<meta property="og:site_name" content="Wizer Properties">')
    
    # Twitter Card tags
    tags.append(f'<meta name="twitter:card" content="summary_large_image">')
    tags.append(f'<meta name="twitter:title" content="{escape(title)}">')
    tags.append(f'<meta name="twitter:description" content="{escape(description)}">')
    tags.append(f'<meta name="twitter:image" content="{escape(image)}">')
    
    # Additional meta tags
    if kwargs.get('author'):
        tags.append(f'<meta name="author" content="{escape(str(kwargs["author"]))}">')
    
    if kwargs.get('robots'):
        tags.append(f'<meta name="robots" content="{escape(str(kwargs["robots"]))}">')
    else:
        tags.append('<meta name="robots" content="index, follow">')
    
    if kwargs.get('published_time'):
        tags.append(f'<meta property="article:published_time" content="{kwargs["published_time"]}">')
    
    if kwargs.get('modified_time'):
        tags.append(f'<meta property="article:modified_time" content="{kwargs["modified_time"]}">')
    
    return mark_safe('\n    '.join(tags))


def generate_property_schema(property_obj: Any) -> SafeString:
    """
    Generate JSON-LD structured data for a property listing
    
    Args:
        property_obj: Property model instance
    
    Returns:
        JSON-LD script tag as safe string
    """
    site_url = get_site_url()
    
    # Get property images from media_files relationship
    property_images = []
    if hasattr(property_obj, 'media_files'):
        images = property_obj.media_files.filter(type='image')[:5]
        for img in images:
            if hasattr(img, 'file') and img.file:
                property_images.append(f"{site_url}{img.file.url}")
    
    schema: dict[str, Any] = {
        "@context": "https://schema.org",
        "@type": "Product",
        "name": property_obj.title or f"Property {property_obj.id}",
        "description": (property_obj.description[:500] if property_obj.description else ""),
        "image": property_images if property_images else [f"{site_url}/static/media/logo.png"],
        "offers": {
            "@type": "Offer",
            "price": str(property_obj.price or 0),
            "priceCurrency": "THB",
            "availability": "https://schema.org/InStock" if (hasattr(property_obj, 'is_available') and property_obj.is_available) or (hasattr(property_obj, 'have_vacant') and property_obj.have_vacant) else "https://schema.org/OutOfStock",
            "url": f"{site_url}{property_obj.get_absolute_url()}"
        },
        "brand": {
            "@type": "Organization",
            "name": property_obj.building.title if property_obj.building else "Wizer Properties"
        }
    }
    
    # Add address if available
    if property_obj.building and property_obj.building.address:
        schema["address"] = {
            "@type": "PostalAddress",
            "streetAddress": property_obj.building.address,
            "addressLocality": "Bangkok",
            "addressCountry": "TH"
        }
    
    # Remove None values
    schema = {k: v for k, v in schema.items() if v is not None}
    
    json_ld = json.dumps(schema, indent=2, ensure_ascii=False)
    return format_html('<script type="application/ld+json">{}</script>', mark_safe(json_ld))


def generate_organization_schema() -> SafeString:
    """Generate JSON-LD structured data for the organization"""
    site_url = get_site_url()
    
    schema: dict[str, Any] = {
        "@context": "https://schema.org",
        "@type": "Organization",
        "name": "Wizer Properties",
        "url": site_url,
        "logo": f"{site_url}/static/media/logo.png",
        "description": "Verified property developments in Thailand for international buyers",
        "sameAs": [
            "https://www.facebook.com/wizerproperties",
            "https://www.youtube.com/@wizerproperties",
            "https://twitter.com/wizerproperties"
        ],
        "contactPoint": {
            "@type": "ContactPoint",
            "contactType": "Customer Service",
            "areaServed": "TH",
            "availableLanguage": ["en", "th"]
        }
    }
    
    json_ld = json.dumps(schema, indent=2, ensure_ascii=False)
    return format_html('<script type="application/ld+json">{}</script>', mark_safe(json_ld))


def generate_article_schema(article_obj: Any) -> SafeString:
    """
    Generate JSON-LD structured data for a blog article
    
    Args:
        article_obj: Blog Post model instance
    
    Returns:
        JSON-LD script tag as safe string
    """
    site_url = get_site_url()
    
    # Get article description
    description = ""
    if hasattr(article_obj, 'subtitle') and article_obj.subtitle:
        description = article_obj.subtitle[:200]
    elif hasattr(article_obj, 'description') and article_obj.description:
        # Strip HTML tags if description is HTML
        import re
        description = re.sub(r'<[^>]+>', '', str(article_obj.description))[:200]
    
    # Get article image
    image_url = f"{site_url}/static/media/logo.png"
    if hasattr(article_obj, 'banner_image') and article_obj.banner_image:
        image_url = f"{site_url}{article_obj.banner_image.url}"
    
    schema: dict[str, Any] = {
        "@context": "https://schema.org",
        "@type": "Article",
        "headline": article_obj.title or "Blog Post",
        "description": description,
        "image": image_url,
        "datePublished": article_obj.created_at.isoformat() if hasattr(article_obj, 'created_at') and article_obj.created_at else "",
        "dateModified": article_obj.updated_at.isoformat() if hasattr(article_obj, 'updated_at') and article_obj.updated_at else "",
        "author": {
            "@type": "Organization",
            "name": "Wizer Properties"
        },
        "publisher": {
            "@type": "Organization",
            "name": "Wizer Properties",
            "logo": {
                "@type": "ImageObject",
                "url": f"{site_url}/static/media/logo.png"
            }
        }
    }
    
    # Add categories as keywords
    if hasattr(article_obj, 'categories') and article_obj.categories.exists():
        schema["keywords"] = ", ".join([str(cat.name) for cat in article_obj.categories.all()])
    
    json_ld = json.dumps(schema, indent=2, ensure_ascii=False)
    return format_html('<script type="application/ld+json">{}</script>', mark_safe(json_ld))


def generate_breadcrumb_schema(breadcrumbs: list[tuple[str, str]]) -> SafeString:
    """
    Generate JSON-LD structured data for breadcrumbs
    
    Args:
        breadcrumbs: List of tuples (name, url)
    
    Returns:
        JSON-LD script tag as safe string
    """
    site_url = get_site_url()
    
    items = []
    for position, (name, url) in enumerate(breadcrumbs, start=1):
        items.append({
            "@type": "ListItem",
            "position": position,
            "name": name,
            "item": f"{site_url}{url}" if not url.startswith('http') else url
        })
    
    schema: dict[str, Any] = {
        "@context": "https://schema.org",
        "@type": "BreadcrumbList",
        "itemListElement": items
    }
    
    json_ld = json.dumps(schema, indent=2, ensure_ascii=False)
    return format_html('<script type="application/ld+json">{}</script>', mark_safe(json_ld))


def generate_building_schema(building_obj: Any) -> SafeString:
    """
    Generate JSON-LD structured data for a building/project listing
    
    Args:
        building_obj: Building model instance
    
    Returns:
        JSON-LD script tag as safe string
    """
    site_url = get_site_url()
    
    # Get building images from media_files relationship
    building_images = []
    if hasattr(building_obj, 'media_files'):
        images = building_obj.media_files.filter(type='image')[:5]
        for img in images:
            if hasattr(img, 'file') and img.file:
                building_images.append(f"{site_url}{img.file.url}")
    
    schema: dict[str, Any] = {
        "@context": "https://schema.org",
        "@type": "Place",
        "name": building_obj.title or f"Building {building_obj.id}",
        "description": (building_obj.description[:500] if building_obj.description else ""),
        "image": building_images if building_images else [f"{site_url}/static/media/logo.png"],
        "address": {
            "@type": "PostalAddress",
            "streetAddress": building_obj.address or "",
            "addressLocality": building_obj.district or "Bangkok",
            "addressRegion": building_obj.province or "Bangkok",
            "addressCountry": "TH"
        } if building_obj.address else None,
        "geo": {
            "@type": "GeoCoordinates",
            "latitude": building_obj.latitude,
            "longitude": building_obj.longitude
        } if (hasattr(building_obj, 'latitude') and hasattr(building_obj, 'longitude') and building_obj.latitude and building_obj.longitude) else None
    }
    
    # Remove None values
    schema = {k: v for k, v in schema.items() if v is not None}
    
    json_ld = json.dumps(schema, indent=2, ensure_ascii=False)
    return format_html('<script type="application/ld+json">{}</script>', mark_safe(json_ld))

