from django.urls import include, path


urlpatterns = [
    path("api/", include(("advertise.api.urls", "advertise"), namespace="api")),
]
