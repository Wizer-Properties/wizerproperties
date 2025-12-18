from rest_framework import permissions
from typing import Any


class PropertyPermission(permissions.BasePermission):
    def has_permission(self, request: Any, view: Any) -> bool:
        user = request.user

        if request.method in ["POST", "PUT", "PATCH", "DELETE"]:
            if view.action == "manage_property_view_time":
                return True
            return hasattr(user, "developerprofile") or hasattr(user, "agentprofile")
        elif view.action in ["nearest"]:
            if user.is_authenticated:
                return (
                    hasattr(user, "developerprofile")
                    or hasattr(user, "agentprofile")
                    or hasattr(user, "prospectprofile")
                )
            else:
                return True

        return True

    def has_object_permission(self, request: Any, view: Any, obj: Any) -> bool:
        if request.method in ["PUT", "PATCH", "DELETE"]:
            if view.action == "manage_property_view_time":
                return True
            return obj.created_by == request.user  # type: ignore[no-any-return]

        return True
