import calendar
from rest_framework.response import Response
from rest_framework import viewsets, status, permissions
from rest_framework.decorators import action
from django.db.models import Count, F, IntegerField, ExpressionWrapper, OuterRef, Subquery, \
    Value, When, Case, Avg, FloatField, Sum, Min, Max
from django.db.models.functions import Coalesce, TruncMonth
from rest_framework.response import Response
from django.contrib.contenttypes.models import ContentType
from property.models import Property, PropertyVisitorLocation, PropertyVisitLog, \
    PropertyPriceRange, PropertyClickLog
from schedule.models import VisitingSchedule
from building.models import Building
from rest_framework.views import APIView
from django.utils.dateparse import parse_date
from datetime import datetime, timedelta, date


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



class PropertyVisitAnalytics(APIView):
    pagination = {
        "next" : False,
        "previous" : False,
    }
            
    def get_day_suffix(self, day):
        if 4 <= day <= 20 or 24 <= day <= 30:
            return "th"
        else:
            return ["st", "nd", "rd"][day % 10 - 1]
    
    def generate_labels(self, filter_type, start_date, end_date):
        labels = []
        if filter_type == 'weekly':
            week_days = ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun']
            labels = week_days
        elif filter_type == 'monthly':
            num_days = (end_date - start_date).days + 1
            for i in range(1, num_days + 1):
                labels.append(f"{i}{self.get_day_suffix(i)}")
        elif filter_type == 'yearly':
            month_names = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec']
            labels = month_names
        return labels
        

    def filter_visited_logs(self, filter_type, start_date, end_date):
        data = []
        today = date.today()
        user_properties = Property.objects.filter(building__created_by=self.request.user)
        visited_logs = PropertyClickLog.objects.filter(
            property__in=user_properties,
            created_at__range=(start_date, end_date)
        )

        propertylog_min_max = PropertyClickLog.objects.filter(property__in=user_properties) \
                        .aggregate(min_date=Min('created_at'))
        
        min_date = propertylog_min_max['min_date'].date()
        self.pagination["previous"] = start_date if min_date < start_date else False
        self.pagination["next"] = end_date

 
        if filter_type in ["weekly", "monthly"]:
            current_date = start_date
            while current_date <= end_date:
                if today < current_date:
                    self.pagination["next"] = start_date if today > current_date else False
                    break

                weekly_clicked = visited_logs.filter(created_at__date=current_date) \
                                .aggregate(total=Sum('number_of_clicked'))['total'] or 0
                data.append(weekly_clicked)
                current_date += timedelta(days=1)

        elif filter_type == "yearly":
            monthly_data = (visited_logs
                .annotate(month=TruncMonth('created_at'))
                .values('month')
                .annotate(total=Sum('number_of_clicked'))
                .order_by('month')
                .values('month','total'))
            
            current_year = today.year
            current_month = today.month

            data = [0] * 12
            if start_date.year == current_year :
                data = [0] * current_month
                self.pagination["next"] = False

            for data_list in monthly_data:
                month_number = data_list['month'].month - 1
                data[month_number] = data_list['total']

        print( start_date, "===============", end_date)
        return data
    

    def get(self, request):
        filter_type = request.query_params.get('filter_type', 'weekly')
        get_start_date = request.query_params.get('next')
        get_end_date = request.query_params.get('previous')

        start_date = parse_date(request.query_params.get('next', datetime.today().strftime('%Y-%m-%d')))
        end_date = parse_date(request.query_params.get('previous', datetime.today().strftime('%Y-%m-%d')))
        
        if filter_type == "weekly":
            if get_start_date:
                start_of_week = start_date + timedelta(days=1 + start_date.weekday())
                end_date = start_of_week
                start_date = start_of_week - timedelta(days=6)
            elif get_end_date:
                end_of_week = end_date - timedelta(days=(1 - end_date.weekday()))
                end_date = end_of_week
                start_date = end_of_week - timedelta(days=6)
            else:
                start_of_week = start_date - timedelta(days=start_date.weekday())
                start_date = start_of_week
                end_date = start_of_week + timedelta(days=6)

        elif filter_type == "monthly":
            if get_start_date:
                start_date = start_date.replace(day=1) + timedelta(days=31)
                start_date = start_date.replace(day=1)
                end_date = start_date + timedelta(days=31)
                end_date = end_date.replace(day=1) - timedelta(days=1)
            elif get_end_date:
                end_date = end_date.replace(day=1)
                start_date = end_date - timedelta(days=1)
                start_date = start_date.replace(day=1)
            else:
                start_date = start_date.replace(day=1)
                next_month = start_date.replace(day=28) + timedelta(days=4)
                end_date = next_month - timedelta(days=next_month.day)

        elif filter_type == "yearly":
            if get_start_date:
                start_date = start_date.replace(year=start_date.year + 1, month=1, day=1)
                end_date = start_date.replace(year=start_date.year, month=12, day=31)
            elif get_end_date:
                end_date = end_date.replace(year=end_date.year - 1, month=12, day=31)
                start_date = end_date.replace(year=end_date.year, month=1, day=1)
            else:
                current_year = datetime.now().year
                start_date = datetime(current_year, 1, 1).date()
                end_date = datetime(current_year, 12, 31).date()


        visit_data = self.filter_visited_logs(filter_type, start_date, end_date)
        label_list = self.generate_labels(filter_type, start_date, end_date)
        

        return Response({
            "pagination" : self.pagination,
            "visit_data" : visit_data,
            "label_list" : label_list,
        })
    
