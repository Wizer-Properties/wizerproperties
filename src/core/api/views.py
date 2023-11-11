from rest_framework import viewsets

from core.api.serializers import ContactSerializer
from core.models import Contact


class ContactViewSet(viewsets.ModelViewSet):
    serializer_class = ContactSerializer
    serializer_method_fields = ["POST"]

    def get_queryset(self):
        return Contact.objects.all()

