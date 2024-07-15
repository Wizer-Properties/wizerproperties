from rest_framework import pagination
from rest_framework.response import Response

class AdvertisementPagination(pagination.PageNumberPagination):
    page_size = 4  # Number of items per page
    page_size_query_param = 'page_size'

    def get_paginated_response(self, data):
        next_page_number = None
        if self.page.has_next():
            next_page_number = self.page.next_page_number()
        
        previous_page_number = None
        if self.page.has_previous():
            previous_page_number = self.page.previous_page_number()

        return Response({
            'total_pages': self.page.paginator.num_pages,
            'page_size': self.page.paginator.per_page,
            'count': self.page.paginator.count,
            'next': next_page_number,
            'previous': previous_page_number,
            'results': data
        })
