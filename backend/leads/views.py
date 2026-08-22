from rest_framework import viewsets
from rest_framework.permissions import IsAuthenticated
from .models import Lead
from .serializers import LeadSerializer

class LeadViewSet(viewsets.ModelViewSet):
    """
    API endpoint that allows leads to be viewed or edited.
    """
    queryset = Lead.objects.all().order_by('-created_at')
    serializer_class = LeadSerializer
    permission_classes = [IsAuthenticated]
