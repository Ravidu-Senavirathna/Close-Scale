from rest_framework import serializers
from .models import Lead

class LeadSerializer(serializers.ModelSerializer):
    assigned_to_name = serializers.CharField(source='assigned_to.get_full_name', read_only=True)

    class Meta:
        model = Lead
        fields = '__all__'
