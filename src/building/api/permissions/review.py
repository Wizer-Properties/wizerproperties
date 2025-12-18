from rest_framework import permissions
from typing import Any


class BuildingReviewPermission(permissions.BasePermission):
    def has_permission(self, request: Any, view: Any) -> bool:
        if request.method in ["POST"]:
            if not request.user.is_authenticated:
                return False

            return hasattr(request.user, "prospectprofile")

        return True
