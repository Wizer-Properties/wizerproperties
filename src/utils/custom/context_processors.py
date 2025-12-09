from django.conf import settings


def common(request):
    context = {
        "GOOGLE_API_KEY": settings.GOOGLE_API_KEY,
        "GA4_MEASUREMENT_ID": getattr(settings, 'GA4_MEASUREMENT_ID', None),
        "META_PIXEL_ID": getattr(settings, 'META_PIXEL_ID', None),
        "POSTHOG_API_KEY": getattr(settings, 'POSTHOG_API_KEY', None),
        "POSTHOG_HOST": getattr(settings, 'POSTHOG_HOST', None),
    }
    return context
