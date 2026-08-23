from rest_framework import serializers
from .models import Lead, LeadNote

class LeadNoteSerializer(serializers.ModelSerializer):
    author_name = serializers.CharField(source='author.full_name', read_only=True)

    class Meta:
        model = LeadNote
        fields = ['id', 'content', 'author_name', 'created_at']

class LeadSerializer(serializers.ModelSerializer):
    assigned_to_name = serializers.CharField(source='assigned_to.full_name', read_only=True)
    lead_notes = LeadNoteSerializer(many=True, read_only=True)

    class Meta:
        model = Lead
        fields = '__all__'
