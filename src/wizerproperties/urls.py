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
from core.views import dashboard, contact_page, home_page, privacy_page, about_us_page
from core.admin import custom_admin_site


urlpatterns = [
    path("admin/", custom_admin_site.urls),
    path('', home_page, name='home'),
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
]

if settings.DEBUG:
    urlpatterns += static(settings.MEDIA_URL, document_root=settings.MEDIA_ROOT)
    urlpatterns += static(settings.STATIC_URL, document_root=settings.STATIC_ROOT)
