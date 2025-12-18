from rest_framework import permissions
from typing import Any


class BuildingPermission(permissions.BasePermission):
    def has_permission(self, request: Any, view: Any) -> bool:
        if request.method in ["POST", "PUT", "PATCH", "DELETE"]:
            return hasattr(request.user, "developerprofile") or hasattr(request.user, "agentprofile")

        return True

    def has_object_permission(self, request: Any, view: Any, obj: Any) -> bool:
        if request.method in ["PUT", "PATCH", "DELETE"]:
            return bool(obj.created_by == request.user)

        return True
