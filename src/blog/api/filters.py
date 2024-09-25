from django_filters import rest_framework as filters
from blog.models import Post


class PostFilter(filters.FilterSet):
    category = filters.CharFilter(field_name='categories__name', lookup_expr='iexact')
    order_by = filters.ChoiceFilter(
        choices=(
            ('most_read', 'Most Read'),
            ('most_liked', 'Most Liked'),
            ('most_recent', 'Most Recent'),
        ),
        method='filter_order_by'
    )

    class Meta:
        model = Post
        fields = ['category', 'order_by']

    def filter_order_by(self, queryset, name, value):
        if value == 'most_read':
            return queryset.order_by('-total_read_count')
        elif value == 'most_liked':
            return queryset.order_by('-total_likes')
        elif value == 'most_recent':
            return queryset.order_by('-created_at')
        return queryset
