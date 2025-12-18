import logging
from rest_framework import viewsets, status
from rest_framework.response import Response
from rest_framework.decorators import action
from django.db.models import Q
from django.conf import settings
from django.urls import reverse
from schedule.models import VisitingSchedule
from schedule.api.serializers import VisitingScheduleSerializer
from schedule.api.permissions import VisitingSchedulePermission
from building.models import Building
from property.models import Property
from utils.zoho_crm import sync_schedule_to_crm
from typing import Any, Dict, Optional, cast
from user.models import User
from django.db.models import QuerySet
from rest_framework.request import Request

logger = logging.getLogger(__name__)


class VisitingScheduleViewSet(viewsets.ModelViewSet):  # type: ignore[type-arg]
    serializer_class = VisitingScheduleSerializer
    permission_classes = [VisitingSchedulePermission]
    pagination_class = None
    http_method = ["POST", "GET", "PATCH"]
    ordering = ["-created_at"]  # Default ordering

    def get_queryset(self) -> QuerySet[VisitingSchedule]:
        schedule_qs = VisitingSchedule.objects.none()
        user = cast(User, self.request.user)

        if hasattr(user, "prospectprofile"):  # While a user is prospect
            schedule_qs = VisitingSchedule.objects.filter(prospect=user.prospectprofile)
        else:
            building_ids = Building.objects.filter(created_by=user).values_list("id", flat=True)
            property_ids = Property.objects.filter(created_by=user).values_list("id", flat=True)
            schedule_qs = VisitingSchedule.objects.filter(
                Q(content_type__model="building", object_id__in=building_ids)
                | Q(content_type__model="property", object_id__in=property_ids)
            )

        return schedule_qs

    def create(self, request: Any, *args: Any, **kwargs: Any) -> Response:
        serializer = self.get_serializer(data=request.data, context={"request": request})

        if serializer.is_valid():
            schedule_instance = serializer.save()
            
            # Sync to Zoho CRM if enabled
            try:
                if hasattr(request.user, 'prospectprofile') and request.user.prospectprofile:
                    user_email = request.user.email
                    
                    # Get property/building info
                    content_obj = schedule_instance.content_object
                    property_title = ''
                    property_id = ''
                    asset_type = schedule_instance.content_type.model if schedule_instance.content_type else ''
                    
                    if content_obj:
                        property_title = getattr(content_obj, 'title', '') or str(content_obj)
                        property_id = str(content_obj.id) if hasattr(content_obj, 'id') else ''
                        
                        # Get property URL
                        if asset_type == 'property':
                            property_url = f"{settings.SITE_HOST}{reverse('property:get', kwargs={'id': property_id})}"
                        else:
                            property_url = f"{settings.SITE_HOST}{reverse('building:get', kwargs={'id': property_id})}"
                        
                        # Get price if available
                        property_price = 0.0
                        property_bedrooms = ''
                        property_bathrooms = ''
                        property_size = ''
                        property_floor = ''
                        building_name = ''
                        building_type = ''
                        building_status = ''
                        location = ''
                        completion_year = ''
                        
                        if asset_type == 'property' and hasattr(content_obj, 'price'):
                            property_price = float(content_obj.price) if content_obj.price else 0
                            property_bedrooms = getattr(content_obj, 'number_of_bedroom', '') or ''
                            property_bathrooms = getattr(content_obj, 'number_of_bathroom', '') or ''
                            property_size = getattr(content_obj, 'unit_area', '') or ''
                            property_floor = getattr(content_obj, 'floor_number', '') or ''
                            
                            # Get building info if available
                            if hasattr(content_obj, 'building') and content_obj.building:
                                building_name = getattr(content_obj.building, 'title', '') or getattr(content_obj.building, 'name', '') or ''
                                building_type = getattr(content_obj.building, 'type', '') or ''
                                building_status = getattr(content_obj.building, 'status', '') or ''
                                location = getattr(content_obj.building, 'address', '') or ''
                                completion_year = getattr(content_obj.building, 'construction_year', '') or ''
                        elif asset_type == 'building':
                            if hasattr(content_obj, 'lowest_price'):
                                property_price = float(content_obj.lowest_price) if content_obj.lowest_price else 0
                            building_name = getattr(content_obj, 'title', '') or getattr(content_obj, 'name', '') or ''
                            building_type = getattr(content_obj, 'type', '') or ''
                            building_status = getattr(content_obj, 'status', '') or ''
                            location = getattr(content_obj, 'address', '') or ''
                            completion_year = getattr(content_obj, 'construction_year', '') or ''
                    
                    # Get user profile info
                    prospect = request.user.prospectprofile
                    phone = str(getattr(prospect, 'phone_number', '')) if getattr(prospect, 'phone_number', None) else ''
                    first_name = getattr(prospect, 'first_name', '') or ''
                    last_name = getattr(prospect, 'last_name', '') or ''
                    gender = getattr(prospect, 'gender', '') or ''
                    address = getattr(prospect, 'address', '') or ''
                    
                    visiting_time_str = schedule_instance.visiting_time.strftime('%Y-%m-%d %H:%M:%S') if schedule_instance.visiting_time else ''
                    
                    # Sync to Zoho CRM with comprehensive real estate data
                    crm_synced = sync_schedule_to_crm(
                        email=user_email,
                        property_title=property_title,
                        property_id=property_id,
                        visiting_time=visiting_time_str,
                        asset_type=asset_type,
                        phone=phone,
                        property_url=property_url,
                        first_name=first_name,
                        last_name=last_name,
                        gender=gender,
                        address=address,
                        property_price=property_price,
                        property_bedrooms=property_bedrooms,
                        property_bathrooms=property_bathrooms,
                        property_size=property_size,
                        property_floor=property_floor,
                        building_name=building_name,
                        building_type=building_type,
                        building_status=building_status,
                        property_location=location,
                        completion_year=completion_year
                    )
                    
                    if crm_synced:
                        logger.info(f"Successfully synced schedule {schedule_instance.id} to Zoho CRM")
            except Exception:
                # Don't fail the request if CRM sync fails
                logger.exception("Failed to sync schedule to Zoho CRM")
            
            return Response(serializer.data, status=status.HTTP_201_CREATED)
        else:
            return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)

    def partial_update(self, request: Any, *args: Any, **kwargs: Any) -> Response:
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
    def accept_schedule(self, request: Any, *args: Any, **kwargs: Any) -> Response:
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
    def cancel_schedule(self, request: Any, *args: Any, **kwargs: Any) -> Response:
        instance = self.get_object()
        if instance.status != "pending":
            return Response({"status": "Can not change schedule status"}, status=status.HTTP_400_BAD_REQUEST)

        instance.cancel_schedule()
        serializer = self.get_serializer(instance)
        return Response(serializer.data, status=status.HTTP_200_OK)
