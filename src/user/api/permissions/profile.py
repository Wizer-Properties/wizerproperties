from typing import Any
from rest_framework import permissions


class DeveloperProfilePermission(permissions.BasePermission):
    def has_permission(self, request: Any, view: Any) -> bool:
        if request.user.is_authenticated:
            return bool(request.user.user_type == "developer")
        return False


class AgentProfilePermission(permissions.BasePermission):
    def has_permission(self, request: Any, view: Any) -> bool:
        if request.user.is_authenticated:
            return bool(request.user.user_type == "agent")
        return False


class ProspectProfilePermission(permissions.BasePermission):
    def has_permission(self, request: Any, view: Any) -> bool:
        if request.user.is_authenticated:
            return bool(request.user.user_type == "prospect")
        return False
