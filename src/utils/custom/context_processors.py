from django.conf import settings


def common(request):
    context = {
        "GOOGLE_API_KEY": settings.GOOGLE_API_KEY,
    }
    return context
