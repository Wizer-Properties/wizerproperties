from rest_framework import permissions


class VisitingSchedulePermission(permissions.BasePermission):
    def has_permission(self, request, view):
        if view.action == "create":
            return request.user.is_authenticated and hasattr(request.user, "prospectprofile")
        if view.action in ["partial_update", "accept_schedule", "cancel_schedule"]:
            return request.user.is_authenticated

        return True

    def has_object_permission(self, request, view, obj):
        if request.user.is_authenticated:
            if view.action == "partial_update":
                return obj.prospect == request.user.prospectprofile
            elif view.action == "accept_schedule":
                return hasattr(request.user, "developerprofile") or hasattr(request.user, "agentprofile")
            elif view.action == "cancel_schedule":
                return hasattr(request.user, "developerprofile") or hasattr(request.user, "agentprofile") or hasattr(request.user, "prospectprofile")

        return True