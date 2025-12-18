from rest_framework import permissions
from typing import Any


class ComparePropertyPermission(permissions.BasePermission):
    def has_permission(self, request: Any, view: Any) -> bool:
        # Allow all authenticated users to use the compare feature
        return request.user and request.user.is_authenticated  # type: ignore[no-any-return]

    def has_object_permission(self, request: Any, view: Any, obj: Any) -> bool:
        return obj.user == request.user  # type: ignore[no-any-return]
