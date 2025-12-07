from rest_framework import permissions


class ComparePropertyPermission(permissions.BasePermission):
    def has_permission(self, request, view):
        # Allow all authenticated users to use the compare feature
        return request.user and request.user.is_authenticated

    def has_object_permission(self, request, view, obj):
        return obj.user == request.user
