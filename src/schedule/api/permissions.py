from rest_framework import permissions
from typing import Any
from schedule.models import VisitingSchedule


class VisitingSchedulePermission(permissions.BasePermission):
    def has_permission(self, request: Any, view: Any) -> bool:
        if view.action == "create":
            return bool(request.user.is_authenticated and hasattr(request.user, "prospectprofile"))
        if view.action in ["list", "retrieve", "partial_update", "accept_schedule", "cancel_schedule"]:
            return bool(request.user.is_authenticated)
        return False

    def has_object_permission(self, request: Any, view: Any, obj: VisitingSchedule) -> bool:
        if request.user.is_authenticated:
            if view.action == "partial_update" and hasattr(request.user, "prospectprofile"):
                return bool(obj.prospect == request.user.prospectprofile)
            elif view.action == "accept_schedule" and (hasattr(request.user, "developerprofile") or hasattr(request.user, "agentprofile")):
                if obj.content_object and hasattr(obj.content_object, 'created_by'):
                    return bool(obj.content_object.created_by == request.user)
            elif view.action in ["retrieve", "cancel_schedule"]:
                if obj.content_object and hasattr(obj.content_object, 'created_by'):
                    return bool(obj.content_object.created_by == request.user or obj.prospect == request.user.prospectprofile)
                return bool(obj.prospect == request.user.prospectprofile)
        return False