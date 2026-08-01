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
from users.views import (
    ActivateAccountView,
    ChangePasswordView,
    ForgotPasswordView,
    ResetPasswordView,
)

urlpatterns = [
    # Django admin
    path("admin/", admin.site.urls),

    # ── JWT Authentication ──────────────────────────────────────────
    path("api/auth/token/", TokenObtainPairView.as_view(), name="token-obtain-pair"),
    path("api/auth/token/refresh/", TokenRefreshView.as_view(), name="token-refresh"),
    path("api/auth/token/verify/", TokenVerifyView.as_view(), name="token-verify"),
    path("api/auth/token/blacklist/", TokenBlacklistView.as_view(), name="token-blacklist"),
    
    # ── New Auth Flows (Activation & Password Management) ───────────
    path("api/auth/activate/", ActivateAccountView.as_view(), name="activate-account"),
    path("api/auth/forgot-password/", ForgotPasswordView.as_view(), name="forgot-password"),
    path("api/auth/reset-password/", ResetPasswordView.as_view(), name="reset-password"),
    path("api/auth/change-password/", ChangePasswordView.as_view(), name="change-password"),

    # ── Users (CRUD + /me/) ─────────────────────────────────────────────────────────────────────────────
    path("api/users/", include("users.urls")),

    # ── Core API (health check, documents, future epics) ───────────
    path("api/", include("api.urls")),
]
