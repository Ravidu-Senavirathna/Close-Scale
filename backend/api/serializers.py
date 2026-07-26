"""
DRF serializers for the api app.

Currently contains:
  - DocumentSerializer — used for list/retrieve responses
  - DocumentUploadSerializer — used for the multipart upload request
"""

from rest_framework import serializers

from .models import Document


class DocumentSerializer(serializers.ModelSerializer):
    """Read serializer — returned after upload and in list/retrieve responses."""

    uploaded_by_name = serializers.SerializerMethodField()

    class Meta:
        model = Document
        fields = [
            "id",
            "file",
            "file_name",
            "file_type",
            "file_size",
            "uploaded_by",
            "uploaded_by_name",
            "related_lead_id",
            "related_deal_id",
            "related_contact_id",
            "related_project_id",
            "uploaded_at",
        ]
        read_only_fields = fields

    def get_uploaded_by_name(self, obj: Document) -> str:
        """Return the uploader's display name."""
        if obj.uploaded_by:
            return obj.uploaded_by.full_name
        return ""


class DocumentUploadSerializer(serializers.ModelSerializer):
    """Write serializer — accepts the multipart file upload payload."""

    class Meta:
        model = Document
        fields = [
            "file",
            "related_lead_id",
            "related_deal_id",
            "related_contact_id",
            "related_project_id",
        ]

    def validate_file(self, value):
        """
        Reject files that exceed 20 MB or have an unsupported MIME type.
        """
        max_size = 20 * 1024 * 1024  # 20 MB
        allowed_types = {
            "application/pdf",
            "application/msword",
            "application/vnd.openxmlformats-officedocument.wordprocessingml.document",
            "application/vnd.ms-excel",
            "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
            "image/png",
            "image/jpeg",
            "image/jpg",
        }

        if value.size > max_size:
            raise serializers.ValidationError(
                f"File size {value.size} exceeds the 20 MB limit."
            )

        content_type = getattr(value, "content_type", "")
        if content_type not in allowed_types:
            raise serializers.ValidationError(
                f"Unsupported file type '{content_type}'. "
                f"Allowed: PDF, DOC, DOCX, XLS, XLSX, PNG, JPG."
            )
        return value
