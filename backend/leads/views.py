from rest_framework import viewsets
from rest_framework.permissions import IsAuthenticated
from rest_framework.decorators import action
from rest_framework.response import Response
from .models import Lead, LeadNote
from .serializers import LeadSerializer, LeadNoteSerializer

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

    @action(detail=True, methods=['post'])
    def add_note(self, request, pk=None):
        lead = self.get_object()
        content = request.data.get('content')
        if not content:
            return Response({'error': 'Content is required'}, status=400)
        
        note = LeadNote.objects.create(lead=lead, author=request.user, content=content)
        serializer = LeadNoteSerializer(note)
        return Response(serializer.data, status=201)

    @action(detail=True, methods=['delete'], url_path=r'delete_note/(?P<note_id>\d+)')
    def delete_note(self, request, pk=None, note_id=None):
        lead = self.get_object()
        try:
            note = LeadNote.objects.get(pk=note_id, lead=lead)
            # Ensure only the author or manager can delete
            if request.user.role == 'SALES_REP' and note.author != request.user:
                from rest_framework.exceptions import PermissionDenied
                raise PermissionDenied("You can only delete your own notes.")
            note.delete()
            return Response(status=204)
        except LeadNote.DoesNotExist:
            return Response({'error': 'Note not found'}, status=404)

    @action(detail=True, methods=['patch'], url_path=r'edit_note/(?P<note_id>\d+)')
    def edit_note(self, request, pk=None, note_id=None):
        lead = self.get_object()
        try:
            note = LeadNote.objects.get(pk=note_id, lead=lead)
            if request.user.role == 'SALES_REP' and note.author != request.user:
                from rest_framework.exceptions import PermissionDenied
                raise PermissionDenied("You can only edit your own notes.")
            
            content = request.data.get('content')
            if not content:
                return Response({'error': 'Content is required'}, status=400)
                
            note.content = content
            note.save()
            serializer = LeadNoteSerializer(note)
            return Response(serializer.data, status=200)
        except LeadNote.DoesNotExist:
            return Response({'error': 'Note not found'}, status=404)
