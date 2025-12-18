from rest_framework import pagination
from rest_framework.response import Response
from typing import Any, Optional

class UserPropertyPagination(pagination.PageNumberPagination):
    page_size = 12  # Number of items per page
    page_size_query_param = 'page_size'

    def get_paginated_response(self, data: Any) -> Response:
        page = self.page
        if not page:
            return Response({'results': data})

        next_page_number = None
        if page.has_next():
            next_page_number = page.next_page_number()
        
        previous_page_number = None
        if page.has_previous():
            previous_page_number = page.previous_page_number()

        return Response({
            'total_pages': page.paginator.num_pages,
            'page_size': page.paginator.per_page,
            'count': page.paginator.count,
            'next': next_page_number,
            'previous': previous_page_number,
            'results': data
        })
