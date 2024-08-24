import math
from typing import Union
from rest_framework import pagination
from rest_framework.response import Response
from django.db.models import F
from property.models import Property


class PropertySearchPagination(pagination.PageNumberPagination):
    page_query_param = "page"
    page_size_query_param = "page_size"

    def _get_next_page(self) -> Union[int, None]:
        if not self.page.has_next():
            return None
        page_number: int = self.page.next_page_number()
        return page_number

    def _get_previous_page(self) -> Union[int, None]:
        if not self.page.has_previous():
            return None
        page_number: int = self.page.previous_page_number()
        return page_number

    def _get_total_page(self) -> Union[int, None]:
        count = self.page.paginator.count
        page_size = self.get_page_size(self.request)

        return math.ceil(count / page_size)

    def get_paginated_response(self, data):
        # Extract the IDs of the objects from the paginated data
        object_ids = [item['id'] for item in data if 'id' in item]

        # If object appearance in search we will updating
        # property objects search appearance by 1
        if object_ids:
            Property.objects.filter(id__in=object_ids).update(search_appearance=F("search_appearance") + 1)

        return Response(
            {
                "count": self.page.paginator.count,
                "page_size": self.get_page_size(self.request),
                "next": self._get_next_page(),
                "previous": self._get_previous_page(),
                "total_page": self._get_total_page(),
                "results": data,
            }
        )
