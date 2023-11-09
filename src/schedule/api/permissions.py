from rest_framework import permissions


class VisitingSchedulePermission(permissions.BasePermission):
    def has_permission(self, request, view):
        if view.action == "create":
            return request.user.is_authenticated and hasattr(request.user, "prospectprofile")
        if view.action in ["list", "retrieve", "partial_update", "accept_schedule", "cancel_schedule"]:
            return request.user.is_authenticated

    def has_object_permission(self, request, view, obj):
        if request.user.is_authenticated:
            if view.action == "partial_update" and hasattr(request.user, "prospectprofile"):
                return obj.prospect == request.user.prospectprofile
            elif view.action == "accept_schedule" and (hasattr(request.user, "developerprofile") or hasattr(request.user, "agentprofile")):
                return obj.content_object.created_by == request.user
            elif view.action in ["retrieve", "cancel_schedule"]:
                return obj.content_object.created_by == request.user or obj.prospect == request.user.prospectprofile