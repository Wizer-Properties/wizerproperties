from rest_framework import permissions
from typing import Any


class ProspectPropertyFavoritePermission(permissions.BasePermission):
    def has_permission(self, request: Any, view: Any) -> bool:
        return hasattr(request.user, "prospectprofile")

    def has_object_permission(self, request: Any, view: Any, obj: Any) -> bool:
        if request.method in ["DELETE"]:
            return obj.prospect.user == request.user  # type: ignore[no-any-return]

        return True
