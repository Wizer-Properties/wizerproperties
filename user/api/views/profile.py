from rest_framework import viewsets, status
from rest_framework.response import Response
from user.api.serializers import DeveloperProfileSerializer, AgentProfileSerializer, ProspectProfileSerializer


class BaseProfileViewSet(viewsets.ModelViewSet):
    http_method_names = ["post"]

    def create(self, request, *args, **kwargs):
        user = request.user

        if not user.is_authenticated:
            return Response({"detail": "Authentication required"}, status=status.HTTP_401_UNAUTHORIZED)

        serializer = self.get_serializer(data=request.data, context={"user": user})
        if serializer.is_valid():
            serializer.save(user=user)

            user.is_complete_profile = True
            user.save()

            return Response({"detail": "Profile completed successfully"}, status=status.HTTP_200_OK)
        else:
            return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)


class DeveloperProfileViewSet(BaseProfileViewSet):
    serializer_class = DeveloperProfileSerializer


class AgentProfileViewSet(BaseProfileViewSet):
    serializer_class = AgentProfileSerializer


class ProspectProfileViewSet(BaseProfileViewSet):
    serializer_class = ProspectProfileSerializer
