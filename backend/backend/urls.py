"""
Root URL configuration for Close-Scale backend.
"""

from django.contrib import admin
from django.urls import include, path
from rest_framework_simplejwt.views import (
    TokenBlacklistView,
    TokenObtainPairView,
    TokenRefreshView,
    TokenVerifyView,
)

urlpatterns = [
    # Django admin
    path("admin/", admin.site.urls),

    # ── JWT Authentication ──────────────────────────────────────────
    path("api/auth/token/", TokenObtainPairView.as_view(), name="token-obtain-pair"),
    path("api/auth/token/refresh/", TokenRefreshView.as_view(), name="token-refresh"),
    path("api/auth/token/verify/", TokenVerifyView.as_view(), name="token-verify"),
    path("api/auth/token/blacklist/", TokenBlacklistView.as_view(), name="token-blacklist"),

    # ── Users (CRUD + /me/) ─────────────────────────────────────────────────────────────────────────────
    path("api/users/", include("users.urls")),

    # ── Core API (health check, documents, future epics) ───────────
    path("api/", include("api.urls")),
    
    # ── Contacts & Organizations (Epic 2) ──────────────────────────
    path("api/", include("contacts.urls")),
]
