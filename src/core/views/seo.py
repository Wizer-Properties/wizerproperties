"""
SEO-related views: robots.txt and sitemap index
"""

from django.http import HttpResponse
from django.views.decorators.http import require_http_methods
from django.conf import settings


@require_http_methods(["GET"])
def robots_txt(request):
    """
    Generate robots.txt file
    Allows all crawlers except for admin and API endpoints
    """
    site_url = getattr(settings, 'SITE_HOST', 'https://wizerproperties.com')
    
    robots_content = f"""User-agent: *
Allow: /
Disallow: /admin/
Disallow: /api/
Disallow: /user/
Disallow: /dashboard/
Disallow: /property/create/
Disallow: /property/update/
Disallow: /building/create/
Disallow: /building/update/
Disallow: /advertise/
Disallow: /schedule/
Disallow: /accounts/

# Sitemap
Sitemap: {site_url}/sitemap.xml

# Crawl-delay (optional, adjust as needed)
Crawl-delay: 1
"""
    
    response = HttpResponse(robots_content, content_type='text/plain')
    return response

