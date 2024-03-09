from rest_framework import permissions


class ComparePropertyPermission(permissions.BasePermission):
    def has_permission(self, request, view):
        return hasattr(request.user, "prospectprofile")

    def has_object_permission(self, request, view, obj):
        return obj.user == request.user
