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


class IsTechLead(BasePermission):
    """Grants access to Tech Leads."""

    def has_permission(self, request, view) -> bool:
        return bool(
            request.user
            and request.user.is_authenticated
            and request.user.role == User.Role.TECH_LEAD
        )


class IsManager(BasePermission):
    """Grants access to any Manager (Sales)."""

    def has_permission(self, request, view) -> bool:
        return bool(
            request.user
            and request.user.is_authenticated
            and request.user.role == User.Role.SALES_MANAGER
        )


class IsFinanceOfficer(BasePermission):
    """Grants access to Finance Officers."""

    def has_permission(self, request, view) -> bool:
        return bool(
            request.user
            and request.user.is_authenticated
            and request.user.role == User.Role.FINANCE_OFFICER
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
    """Grants access to Admins and any Manager (Sales)."""

    def has_permission(self, request, view) -> bool:
        return bool(
            request.user
            and request.user.is_authenticated
            and request.user.role in (User.Role.ADMIN, User.Role.SALES_MANAGER)
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
