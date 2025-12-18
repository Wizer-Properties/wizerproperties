import math
from typing import Any, Union

from rest_framework import pagination
from rest_framework.response import Response


class CustomPagination(pagination.PageNumberPagination):
    page_query_param = "page"
    page_size_query_param = "page_size"

    def _get_next_page(self) -> Union[int, None]:
        if self.page is None or not self.page.has_next():
            return None
        page_number: int = self.page.next_page_number()
        return page_number

    def _get_previous_page(self) -> Union[int, None]:
        if self.page is None or not self.page.has_previous():
            return None
        page_number: int = self.page.previous_page_number()
        return page_number

    def _get_total_page(self) -> Union[int, None]:
        if self.page is None:
            return None
        count = self.page.paginator.count
        request = self.request 
        if request is None: 
            return 1
            
        page_size = self.get_page_size(request)
        if not page_size:
            return 1

        return math.ceil(count / page_size)

    def get_paginated_response(self, data: Any) -> Response:
        if self.page is None:
            return Response(data)
        
        page_size = 10
        if self.request:
             page_size = self.get_page_size(self.request) or 10

        return Response(
            {
                "count": self.page.paginator.count,
                "page_size": page_size,
                "next": self._get_next_page(),
                "previous": self._get_previous_page(),
                "total_page": self._get_total_page(),
                "results": data,
            }
        )
