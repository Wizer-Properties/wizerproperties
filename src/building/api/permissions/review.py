from rest_framework import permissions


class BuildingReviewPermission(permissions.BasePermission):
    def has_permission(self, request, view):
        if request.method in ["POST"]:
            if not request.user.is_authenticated:
                return False

            return hasattr(request.user, "prospectprofile")

        return True
