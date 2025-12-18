from rest_framework import permissions
from typing import Any


class ReelPermission(permissions.BasePermission):
    def has_permission(self, request: Any, view: Any) -> bool:
        if view.action in ["list", "create", "update", "partial_update", "destroy"]:
            return hasattr(request.user, "developerprofile") or hasattr(request.user, "agentprofile")
        return True

    def has_object_permission(self, request: Any, view: Any, obj: Any) -> bool:
        if view.action in ["update", "partial_update", "destroy"]:
            return obj.created_by == request.user  # type: ignore[no-any-return]
        return True
