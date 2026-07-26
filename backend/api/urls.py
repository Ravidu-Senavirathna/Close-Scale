"""URL patterns for the core api app."""

# pyrefly: ignore [missing-import]
from django.urls import path

from . import views

urlpatterns = [
    # ── Utility ───────────────────────────────────────────────────────
    path("", views.home, name="home"),
    path("health/", views.health_check, name="health-check"),

    # ── Documents (F9.1) ──────────────────────────────────────────────
    path("documents/", views.DocumentListView.as_view(), name="document-list"),
    path("documents/upload/", views.DocumentUploadView.as_view(), name="document-upload"),
    path("documents/<int:pk>/download/", views.DocumentDownloadView.as_view(), name="document-download"),
    path("documents/<int:pk>/", views.DocumentDeleteView.as_view(), name="document-delete"),
]
