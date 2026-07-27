"""
Models for the core API app.

Currently contains:
  - Document — generic file attachment linked to any CRM entity.

Note on entity links:
  The FK fields for Lead, Deal, Contact, and Project are stored as plain
  PositiveIntegerFields now.  They will be converted to proper ForeignKeys
  when those apps (Epic 2–7) are created and their migrations run.
"""

from django.conf import settings
from django.db import models


class Document(models.Model):
    """
    A file uploaded and linked to a CRM entity (Lead, Deal, Contact, or Project).

    Storage is handled by Cloudinary via ``cloudinary_storage`` (configured in
    ``settings.STORAGES["default"]``).  The ``file_type`` field is populated
    from the uploaded file's content type in the view.
    """

    # ── File payload ──────────────────────────────────────────────────
    file = models.FileField(upload_to="documents/%Y/%m/")
    file_name = models.CharField(max_length=255)
    file_type = models.CharField(max_length=100, blank=True)
    file_size = models.PositiveIntegerField(help_text="File size in bytes.")

    # ── Ownership ─────────────────────────────────────────────────────
    uploaded_by = models.ForeignKey(
        settings.AUTH_USER_MODEL,
        on_delete=models.SET_NULL,
        null=True,
        related_name="documents",
    )

    # ── Entity links (plain IDs until the target apps are created) ────
    # These will be migrated to ForeignKeys in Epic 2–7 migrations.
    related_lead_id = models.PositiveIntegerField(null=True, blank=True, db_index=True)
    related_deal_id = models.PositiveIntegerField(null=True, blank=True, db_index=True)
    
    related_contact = models.ForeignKey(
        "contacts.Contact", 
        on_delete=models.SET_NULL, 
        null=True, 
        blank=True, 
        related_name="documents"
    )
    related_organization = models.ForeignKey(
        "contacts.Organization", 
        on_delete=models.SET_NULL, 
        null=True, 
        blank=True, 
        related_name="documents"
    )
    
    related_project_id = models.PositiveIntegerField(null=True, blank=True, db_index=True)

    # ── Timestamps ────────────────────────────────────────────────────
    uploaded_at = models.DateTimeField(auto_now_add=True)

    class Meta:
        ordering = ["-uploaded_at"]
        verbose_name = "Document"
        verbose_name_plural = "Documents"

    def __str__(self) -> str:
        return f"{self.file_name} (uploaded by {self.uploaded_by})"
