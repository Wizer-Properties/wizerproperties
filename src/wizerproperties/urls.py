"""
URL configuration for wizerproperties project.

The `urlpatterns` list routes URLs to views. For more information please see:
    https://docs.djangoproject.com/en/4.2/topics/http/urls/
Examples:
Function views
    1. Add an import:  from my_app import views
    2. Add a URL to urlpatterns:  path('', views.home, name='home')
Class-based views
    1. Add an import:  from other_app.views import Home
    2. Add a URL to urlpatterns:  path('', Home.as_view(), name='home')
Including another URLconf
    1. Import the include() function: from django.urls import include, path
    2. Add a URL to urlpatterns:  path('blog/', include('blog.urls'))
"""
# from django.contrib import admin
from django.urls import path, include
from django.conf import settings
from django.conf.urls.static import static
from django.contrib.sitemaps.views import sitemap
from core.views import dashboard, contact_page, home_page, developer_home_page, developer_pricing_page, privacy_page, about_us_page, custom_404, robots_txt
from core.admin import custom_admin_site
from core.sitemaps import StaticViewSitemap, PropertySitemap, BlogPostSitemap, BuildingSitemap
from allauth.socialaccount.providers.google.views import oauth2_login, oauth2_callback
from advertise.views import reels

urlpatterns = [
    path("admin/", custom_admin_site.urls),
    path('', home_page, name='home'),
    path('developers/', developer_home_page, name='developer-home'),
    path('developers/pricing/', developer_pricing_page, name='developer-pricing'),
    path('dashboard/', dashboard, name='dashboard'),
    path('contact/', contact_page, name='contact'),
    path("user/", include(("user.urls", "user"), namespace="user")),
    path("building/", include(("building.urls", "building"), namespace="building")),
    path("property/", include(("property.urls", "property"), namespace="property")),
    path("schedule/", include(("schedule.urls", "schedule"), namespace="schedule")),
    path("core/", include(("core.urls", "core"), namespace="core")),
    path("advertise/", include(("advertise.urls", "advertise"), namespace="advertise")),
    path("blogs/", include(("blog.urls", "blog"), namespace="blogs")),
    path('about-us/', about_us_page, name='about-us'),
    path('privacy/', privacy_page, name='privacy'),
    path('reels/', reels, name='reels'),
    # google auth
    path('accounts/google/login/', oauth2_login, name='google_login'),  # Login with Google
    path('accounts/google/login/callback/', oauth2_callback, name='google_callback'),  # Callback
    path('404/', custom_404, name='custom_404'),
    
    # SEO
    path('robots.txt', robots_txt, name='robots_txt'),
    path('sitemap.xml', sitemap, {
        'sitemaps': {
            'static': StaticViewSitemap,
            'properties': PropertySitemap,
            'blog': BlogPostSitemap,
            'buildings': BuildingSitemap,
        }
    }, name='django.contrib.sitemaps.views.sitemap'),
]

if settings.DEBUG:
    from django.contrib.staticfiles.urls import staticfiles_urlpatterns
    urlpatterns += static(settings.MEDIA_URL, document_root=settings.MEDIA_ROOT)
    urlpatterns += staticfiles_urlpatterns()  # Automatically serves from STATICFILES_DIRS

urlpatterns += [path("ckeditor5/", include('django_ckeditor_5.urls'))]

