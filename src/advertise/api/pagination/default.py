from rest_framework import pagination
from rest_framework.response import Response

class ReelPagination(pagination.PageNumberPagination):
    page_size = 4  # Number of items per page
    page_size_query_param = 'page_size'

    def get_paginated_response(self, data):
        return Response({
            'total_pages': self.page.paginator.num_pages,
            'page_size': self.page.paginator.per_page,
            'count': self.page.paginator.count,
            'next': self.get_next_link(),
            'previous': self.get_previous_link(),
            'results': data
        })
