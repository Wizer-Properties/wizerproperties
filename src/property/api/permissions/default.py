from rest_framework import permissions


class PropertyPermission(permissions.BasePermission):
    def has_permission(self, request, view):
        user = request.user

        if request.method in ["POST", "PUT", "PATCH", "DELETE"]:
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

    def has_object_permission(self, request, view, obj):
        if request.method in ["PUT", "PATCH", "DELETE"]:
            return obj.created_by == request.user

        return True
