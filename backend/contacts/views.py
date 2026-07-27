from rest_framework import viewsets
from rest_framework.filters import SearchFilter, OrderingFilter
from django_filters.rest_framework import DjangoFilterBackend
from .models import Organization, Contact
from .serializers import OrganizationSerializer, ContactSerializer

class OrganizationViewSet(viewsets.ModelViewSet):
    queryset = Organization.objects.all()
    serializer_class = OrganizationSerializer
    filter_backends = [DjangoFilterBackend, SearchFilter, OrderingFilter]
    search_fields = ["name", "industry"]
    filterset_fields = ["industry"]
    ordering_fields = ["name", "created_at"]
    ordering = ["-created_at"]

class ContactViewSet(viewsets.ModelViewSet):
    queryset = Contact.objects.select_related("organization").all()
    serializer_class = ContactSerializer
    filter_backends = [DjangoFilterBackend, SearchFilter, OrderingFilter]
    search_fields = ["first_name", "last_name", "email", "organization__name"]
    filterset_fields = ["organization", "job_title"]
    ordering_fields = ["first_name", "last_name", "created_at"]
    ordering = ["-created_at"]
