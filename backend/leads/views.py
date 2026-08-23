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

    def get_queryset(self):
        user = self.request.user
        queryset = Lead.objects.all().order_by('-created_at')
        
        # Sales Reps should only see leads assigned to them
        if user.role == 'SALES_REP':
            queryset = queryset.filter(assigned_to=user)
            
        return queryset

    def perform_update(self, serializer):
        user = self.request.user
        if user.role == 'SALES_REP':
            # Ignore or block attempts to change assigned_to
            if 'assigned_to' in self.request.data:
                from rest_framework.exceptions import PermissionDenied
                new_assigned_to = self.request.data.get('assigned_to')
                # If they try to change it to something else, deny
                if str(new_assigned_to) != str(serializer.instance.assigned_to_id):
                    raise PermissionDenied("Sales Representatives cannot reassign leads.")
        serializer.save()
