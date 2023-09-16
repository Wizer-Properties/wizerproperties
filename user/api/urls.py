from django.urls import include, path
from rest_framework.routers import DefaultRouter
from .views import DeveloperProfileViewSet, AgentProfileViewSet, ProspectProfileViewSet

router = DefaultRouter()
router.register(r"developers-profile", DeveloperProfileViewSet, basename="developer")
router.register(r"agents-profile", AgentProfileViewSet, basename="agent")
router.register(r"prospects-profile", ProspectProfileViewSet, basename="prospect")

urlpatterns = [
    path("", include(router.urls)),
]
