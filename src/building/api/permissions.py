from rest_framework import permissions

class BuildingPermission(permissions.BasePermission):
    def has_permission(self, request, view):
        if request.method in ['POST', 'PUT', 'PATCH', 'DELETE']:
            if hasattr(request.user, 'developerprofile') or hasattr(request.user, 'agentprofile'):
                return True
            return False
        return request.user.is_authenticated