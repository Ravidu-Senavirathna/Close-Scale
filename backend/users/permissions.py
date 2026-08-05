"""
Custom DRF permission classes for Close-Scale (Altrium CRM).

Usage:
    from users.permissions import IsAdminUser, IsSalesManager, IsProjectManager

    class MyView(APIView):
        permission_classes = [IsAuthenticated, IsAdminUser]
"""

from rest_framework.permissions import BasePermission

from .models import User


class IsSalesRep(BasePermission):
    """Grants access to users with the Sales Representative role."""

    def has_permission(self, request, view) -> bool:
        return bool(
            request.user
            and request.user.is_authenticated
            and request.user.role == User.Role.SALES_REP
        )


class IsSalesManager(BasePermission):
    """Grants access to Sales Managers."""

    def has_permission(self, request, view) -> bool:
        return bool(
            request.user
            and request.user.is_authenticated
            and request.user.role == User.Role.SALES_MANAGER
        )


class IsProjectManager(BasePermission):
    """Grants access to Project Managers."""

    def has_permission(self, request, view) -> bool:
        return bool(
            request.user
            and request.user.is_authenticated
            and request.user.role == User.Role.PROJECT_MANAGER
        )


class IsManager(BasePermission):
    """Grants access to any Manager (Sales or Projects)."""

    def has_permission(self, request, view) -> bool:
        return bool(
            request.user
            and request.user.is_authenticated
            and request.user.role in (User.Role.SALES_MANAGER, User.Role.PROJECT_MANAGER)
        )


class IsCEOOrDirector(BasePermission):
    """Grants access to CEO / Director role users."""

    def has_permission(self, request, view) -> bool:
        return bool(
            request.user
            and request.user.is_authenticated
            and request.user.role == User.Role.CEO
        )


class IsAdminUser(BasePermission):
    """Grants access to Administrator role users."""

    def has_permission(self, request, view) -> bool:
        return bool(
            request.user
            and request.user.is_authenticated
            and request.user.role == User.Role.ADMIN
        )


class IsAdminOrManager(BasePermission):
    """Grants access to Admins and any Manager (Sales or Projects)."""

    def has_permission(self, request, view) -> bool:
        return bool(
            request.user
            and request.user.is_authenticated
            and request.user.role in (User.Role.ADMIN, User.Role.SALES_MANAGER, User.Role.PROJECT_MANAGER)
        )


class IsAdminOrSalesManager(BasePermission):
    """Grants access to Admins and Sales Managers."""

    def has_permission(self, request, view) -> bool:
        user = request.user
        if not (user and user.is_authenticated):
            return False
        if user.role == User.Role.ADMIN:
            return True
        return user.role == User.Role.SALES_MANAGER
