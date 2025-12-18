from rest_framework import permissions
from typing import Any


class AdvertisementPermission(permissions.BasePermission):
    def has_permission(self, request: Any, view: Any) -> bool:
        if view.action in ["advertisement_analytics", "advertisement_list"]:
            return hasattr(request.user, "developerprofile") or hasattr(request.user, "agentprofile")
        return True

    def has_object_permission(self, request: Any, view: Any, obj: Any) -> bool:
        if view.action in ["advertisement_analytics", "advertisement_list"]:
            if hasattr(request.user, "developerprofile") or hasattr(request.user, "agentprofile"):
                return obj.property.created_by == request.user  # type: ignore[no-any-return]
        return True
