from rest_framework import permissions


class PropertyPermission(permissions.BasePermission):
    def has_permission(self, request, view):
        if request.method in ["POST", "PUT", "PATCH", "DELETE"]:
            return hasattr(request.user, "developerprofile") or hasattr(request.user, "agentprofile")

        return True

    def has_object_permission(self, request, view, obj):
        if request.method in ["PUT", "PATCH", "DELETE"]:
            return obj.created_by == request.user

        return True
