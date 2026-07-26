# pyrefly: ignore [missing-import]
from django.http import FileResponse, JsonResponse
from rest_framework import status
from rest_framework.parsers import MultiPartParser, FormParser
from rest_framework.permissions import IsAuthenticated
from rest_framework.request import Request
from rest_framework.response import Response
from rest_framework.views import APIView

from .models import Document
from .serializers import DocumentSerializer, DocumentUploadSerializer
from users.permissions import IsAdminUser


def home(request) -> JsonResponse:
    """Root API endpoint."""
    return JsonResponse({"message": "Close-Scale API is running."})


def health_check(request) -> JsonResponse:
    """
    Health check endpoint polled by Render to verify the service is alive.
    Returns HTTP 200 when Django and the database are reachable.
    """
    # pyrefly: ignore [missing-import]
    from django.db import connection

    try:
        connection.ensure_connection()
        db_status = "ok"
    except Exception:
        db_status = "unavailable"

    return JsonResponse(
        {
            "status": "ok" if db_status == "ok" else "degraded",
            "database": db_status,
        },
        status=200 if db_status == "ok" else 503,
    )


# ── Document Views ─────────────────────────────────────────────────────────────

class DocumentUploadView(APIView):
    """
    POST /api/documents/
    Upload a file and link it to a CRM entity.
    Accepts multipart/form-data.
    """

    permission_classes = [IsAuthenticated]
    parser_classes = [MultiPartParser, FormParser]

    def post(self, request: Request) -> Response:
        serializer = DocumentUploadSerializer(data=request.data)
        if not serializer.is_valid():
            return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)

        uploaded_file = serializer.validated_data["file"]
        doc = serializer.save(
            uploaded_by=request.user,
            file_name=uploaded_file.name,
            file_type=getattr(uploaded_file, "content_type", ""),
            file_size=uploaded_file.size,
        )
        return Response(DocumentSerializer(doc).data, status=status.HTTP_201_CREATED)


class DocumentListView(APIView):
    """
    GET /api/documents/
    List documents, optionally filtered by entity.

    Query params: ?lead=<id>  ?deal=<id>  ?contact=<id>  ?project=<id>
    """

    permission_classes = [IsAuthenticated]

    def get(self, request: Request) -> Response:
        qs = Document.objects.select_related("uploaded_by")

        # Apply entity filters
        if lead_id := request.query_params.get("lead"):
            qs = qs.filter(related_lead_id=lead_id)
        elif deal_id := request.query_params.get("deal"):
            qs = qs.filter(related_deal_id=deal_id)
        elif contact_id := request.query_params.get("contact"):
            qs = qs.filter(related_contact_id=contact_id)
        elif project_id := request.query_params.get("project"):
            qs = qs.filter(related_project_id=project_id)

        serializer = DocumentSerializer(qs, many=True)
        return Response(serializer.data)


class DocumentDownloadView(APIView):
    """
    GET /api/documents/{id}/download/
    Stream the document file to the client.
    Only the uploader, Admins, and (future) entity participants may download.
    """

    permission_classes = [IsAuthenticated]

    def get(self, request: Request, pk: int) -> Response:
        try:
            doc = Document.objects.get(pk=pk)
        except Document.DoesNotExist:
            return Response({"detail": "Document not found."}, status=status.HTTP_404_NOT_FOUND)

        # Basic access check: uploader or Admin
        if doc.uploaded_by != request.user and request.user.role != "ADMIN":
            return Response({"detail": "Access denied."}, status=status.HTTP_403_FORBIDDEN)

        try:
            return FileResponse(
                doc.file.open("rb"),
                as_attachment=True,
                filename=doc.file_name,
            )
        except Exception:
            return Response(
                {"detail": "File could not be retrieved."},
                status=status.HTTP_500_INTERNAL_SERVER_ERROR,
            )


class DocumentDeleteView(APIView):
    """
    DELETE /api/documents/{id}/
    Delete the document record and its file. Uploader or Admin only.
    """

    permission_classes = [IsAuthenticated]

    def delete(self, request: Request, pk: int) -> Response:
        try:
            doc = Document.objects.get(pk=pk)
        except Document.DoesNotExist:
            return Response({"detail": "Document not found."}, status=status.HTTP_404_NOT_FOUND)

        # Only uploader or Admin may delete
        if doc.uploaded_by != request.user and request.user.role != "ADMIN":
            return Response({"detail": "Access denied."}, status=status.HTTP_403_FORBIDDEN)

        # Delete file from Cloudinary storage then remove the DB record
        doc.file.delete(save=False)
        doc.delete()
        return Response(status=status.HTTP_204_NO_CONTENT)
