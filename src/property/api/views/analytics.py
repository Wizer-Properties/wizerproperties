from rest_framework.response import Response
from rest_framework import viewsets, status, permissions
from rest_framework.decorators import action
from property.models import Property, PropertyVisitorLocation, PropertyVisitLog, \
    PropertyPriceRange


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
    
    