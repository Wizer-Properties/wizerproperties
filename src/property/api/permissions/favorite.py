from rest_framework import permissions


class ProspectPropertyFavoritePermission(permissions.BasePermission):
    def has_permission(self, request, view):
        return hasattr(request.user, "prospectprofile")

    def has_object_permission(self, request, view, obj):
        if request.method in ["DELETE"]:
            return obj.prospect.user == request.user

        return True
