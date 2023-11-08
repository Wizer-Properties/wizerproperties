from rest_framework import viewsets, status
from rest_framework.response import Response
from rest_framework.decorators import action
from schedule.models import VisitingSchedule
from schedule.api.serializers import VisitingScheduleSerializer
from schedule.api.permissions import VisitingSchedulePermission


class VisitingScheduleViewSet(viewsets.ModelViewSet):
    queryset = VisitingSchedule.objects.all()
    serializer_class = VisitingScheduleSerializer
    permission_classes = [VisitingSchedulePermission]

    def create(self, request, *args, **kwargs):
        serializer = self.get_serializer(data=request.data, context={"request": request})

        if serializer.is_valid():
            serializer.save()
            return Response(serializer.data, status=status.HTTP_201_CREATED)
        else:
            return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)

    def partial_update(self, request, *args, **kwargs):
        instance = self.get_object()
        serializer = self.get_serializer(instance, data=request.data, context={"request": request})

        if not serializer.is_valid():
            return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)

        # Update data in database and response to user
        response_data = super().update(request, *args, **kwargs)
        return Response(response_data.data, status=status.HTTP_200_OK)

    @action(
        detail=True,
        methods=["PATCH"],
        url_path="accept",
    )
    def accept_schedule(self, request, *args, **kwargs):
        instance = self.get_object()
        if instance.status != "pending":
            return Response({"status": "Can not change schedule status"}, status=status.HTTP_400_BAD_REQUEST)

        instance.accept_schedule()
        serializer = self.get_serializer(instance)
        return Response(serializer.data, status=status.HTTP_200_OK)

    @action(
        detail=True,
        methods=["PATCH"],
        url_path="cancel",
    )
    def cancel_schedule(self, request, *args, **kwargs):
        instance = self.get_object()
        if instance.status != "pending":
            return Response({"status": "Can not change schedule status"}, status=status.HTTP_400_BAD_REQUEST)

        instance.cancel_schedule()
        serializer = self.get_serializer(instance)
        return Response(serializer.data, status=status.HTTP_200_OK)
