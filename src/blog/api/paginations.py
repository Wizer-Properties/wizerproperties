from rest_framework.pagination import PageNumberPagination
from rest_framework.response import Response
from typing import Any


class CustomPagination(PageNumberPagination):
    page_size = 10
    page_size_query_param = 'page_size'

    def get_paginated_response(self, data: Any) -> Response:
        if self.page is None:
            return Response(data)
        return Response({
            'links': {
                'next': self.get_next_link(),
                'previous': self.get_previous_link()
            },
            'count': self.page.paginator.count,
            'total_pages': self.page.paginator.num_pages,
            'results': data
        })
