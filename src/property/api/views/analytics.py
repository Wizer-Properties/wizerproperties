from rest_framework.response import Response
from rest_framework import viewsets, status, permissions
from rest_framework.decorators import action
from django.db.models import Count, F, IntegerField, ExpressionWrapper, OuterRef, Subquery, \
    Value, When, Case, Avg, FloatField, Sum
from django.db.models.functions import Coalesce
from rest_framework.response import Response
from django.contrib.contenttypes.models import ContentType

from property.models import Property, PropertyVisitorLocation, PropertyVisitLog, \
    PropertyPriceRange
from schedule.models import VisitingSchedule
from building.models import Building


class PropertiesAnalyticsView(viewsets.ModelViewSet):
    queryset = Property.objects.all()
    permission_classes = [permissions.IsAuthenticated]

    @action(detail=False, methods=['get'])
    def top_ranked_properties(self, request):
        properties = Property.objects.filter(building__created_by=request.user).values(
            "title", "visit_count").order_by("-visit_count")
        
        return Response(properties, status=status.HTTP_200_OK)
    
    @action(detail=False, methods=['get'])
    def maximum_viewing_time_properties(self, request):
        properties = Property.objects.filter(building__created_by=request.user).values(
            "title", "view_time").order_by("-view_time")
        
        return Response(properties, status=status.HTTP_200_OK)
    
    @action(detail=False, methods=['get'])
    def highest_search_appearances_properties(self, request):
        properties = Property.objects.filter(building__created_by=request.user).values(
            "title", "search_appearance").order_by("-search_appearance")
        
        return Response(properties, status=status.HTTP_200_OK)
    
    @action(detail=False, methods=['get'])
    def popular_search_location_properties(self, request):
        properties = PropertyVisitorLocation.objects.filter(
            property__building__created_by=request.user).values(
            "address", "view_from_this_location").order_by("-view_from_this_location")
        
        return Response(properties, status=status.HTTP_200_OK)
    
    @action(detail=False, methods=['get'])
    def user_analytics_properties(self, request):
        properties = Property.objects.filter(building__created_by=request.user)
        
        properties_list = []
        for property in properties:
            total_visitors = property.male_visitors + property.female_visitors
            male_percentage = 0
            female_percentage = 0
            
            if total_visitors > 0:
                male_percentage = (property.male_visitors / total_visitors) * 100
                female_percentage = (property.female_visitors / total_visitors) * 100
            
            properties_list.append({
                "gender_ratio":{
                    "male": male_percentage,
                    "female": female_percentage,
                },
                "location_list": list(PropertyVisitLog.objects.filter(property=property).values_list("location", flat=True))
            })
        
        return Response(properties_list, status=status.HTTP_200_OK)
    
    @action(detail=False, methods=['get'])
    def most_in_demand_price_range(self, request):
        properties = PropertyPriceRange.objects.values(
            "range", "search_appearance").order_by("-search_appearance")
        
        return Response(properties, status=status.HTTP_200_OK)
    
    @action(detail=False, methods=['get'])
    def top_performing_properties_by_conversion(self, request):
        # Get the content type for Property model
        property_content_type = ContentType.objects.get_for_model(Property)

        # Subquery to count the number of accepted schedules for each property
        schedules_subquery = VisitingSchedule.objects.filter(
            content_type=property_content_type,
            object_id=OuterRef('pk'),
        ).values('object_id').annotate(total_schedules=Count('id')).values('total_schedules')
        
        # Annotate properties with the count of views and schedules
        properties = Property.objects.filter(building__created_by=request.user).annotate(
            total_views=F('visit_count'),
            total_schedules=Coalesce(Subquery(schedules_subquery, output_field=IntegerField()), Value(0))
        ).annotate(
            conversion_rate=Case(
                When(total_views__gt=0, then=ExpressionWrapper(
                        F('total_schedules') * 100 / F('total_views'),
                        output_field=IntegerField()
                    )
                ),
                default=Value(0),
                output_field=IntegerField()
            )
        ).order_by('-conversion_rate')  # Order by conversion rate in descending order
        
        properties = list(properties.values("title", "conversion_rate"))

        return Response(properties)
    
    @action(detail=False, methods=['get'])
    def top_rated_buildings(self, request):
        properties = Building.objects.filter(created_by=request.user).annotate(
            average_rating=Coalesce(Avg('reviews__rating'), Value(0),  output_field=FloatField()),
            review_count=Coalesce(Count('reviews'), Value(0),  output_field=IntegerField())
        ).order_by('-average_rating', "-review_count")
        
        properties = list(properties.values("title", "average_rating"))
        
        return Response(properties, status=status.HTTP_200_OK)
    
    @action(detail=False, methods=['get'])
    def most_favorite_properties(self, request):
        properties = Property.objects.filter(building__created_by=request.user).annotate(
            favorite_count=Coalesce(Count('favorites'), Value(0),  output_field=IntegerField())
        ).order_by("-favorite_count")
        
        properties = list(properties.values("title", "favorite_count"))
        
        return Response(properties, status=status.HTTP_200_OK)
    
    @action(detail=False, methods=['get'])
    def most_appeared_on_the_compare_list(self, request):
        properties = Property.objects.filter(building__created_by=request.user).annotate(
            compare_count=Coalesce(Count('compares'), Value(0),  output_field=IntegerField())
        ).order_by("-compare_count")
        
        properties = list(properties.values("title", "compare_count"))
        
        return Response(properties, status=status.HTTP_200_OK)
