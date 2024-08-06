from rest_framework.response import Response
from rest_framework import viewsets, status, permissions
from rest_framework.decorators import action
from property.models import Property


class PropertiesAnalyticsView(viewsets.ModelViewSet):
    queryset = Property.objects.all()
    # permission_classes = [permissions.IsAuthenticated]

    @action(detail=False, methods=['get'])
    def top_ranked_properties(self, request):
        building_id = request.GET.get('building_id')
        properties = Property.objects.filter(building_id=building_id).values(
            "title", "visit_count").order_by("visit_count")
        
        return Response(properties, status=status.HTTP_200_OK)
    
    @action(detail=False, methods=['get'])
    def maximum_viewing_time_properties(self, request):
        building_id = request.GET.get('building_id')
        properties = Property.objects.filter(building_id=building_id).values(
            "title", "view_time").order_by("view_time")
        
        return Response(properties, status=status.HTTP_200_OK)
    
    @action(detail=False, methods=['get'])
    def highest_search_appearances_properties(self, request):
        building_id = request.GET.get('building_id')
        properties = Property.objects.filter(building_id=building_id).values(
            "title", "search_appearance").order_by("search_appearance")
        
        return Response(properties, status=status.HTTP_200_OK)
    
    