from django.urls import path
from .views import DeveloperProfileViewSet, AgentProfileViewSet, ProspectProfileViewSet

urlpatterns = [
    path("developer-create/", DeveloperProfileViewSet.as_view({"post": "create"}), name="developer_create"),
    path("agent-create/", AgentProfileViewSet.as_view({"post": "create"}), name="agent_create"),
    path("prospect-create/", ProspectProfileViewSet.as_view({"post": "create"}), name="prospect_create"),
    path(
        "developer-update/<int:pk>/",
        DeveloperProfileViewSet.as_view({"put": "update", "patch": "partial_update"}),
        name="developer_update",
    ),
    path(
        "agent-update/<int:pk>/",
        AgentProfileViewSet.as_view({"put": "update", "patch": "partial_update"}),
        name="agent_update",
    ),
    path(
        "prospect-update/<int:pk>/",
        ProspectProfileViewSet.as_view({"put": "update", "patch": "partial_update"}),
        name="prospect_update",
    ),
]
