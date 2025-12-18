from typing import Any, TYPE_CHECKING
from django.conf import settings

if TYPE_CHECKING:
    from django.http import HttpRequest

def common(request: "HttpRequest") -> dict[str, Any]:
    context = {
        "GOOGLE_API_KEY": str(getattr(settings, 'GOOGLE_API_KEY', '')),
        "GA4_MEASUREMENT_ID": getattr(settings, 'GA4_MEASUREMENT_ID', None),
        "META_PIXEL_ID": getattr(settings, 'META_PIXEL_ID', None),
        "POSTHOG_API_KEY": getattr(settings, 'POSTHOG_API_KEY', None),
        "POSTHOG_HOST": getattr(settings, 'POSTHOG_HOST', None),
    }
    return context
