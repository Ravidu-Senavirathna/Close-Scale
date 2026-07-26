"""
API views for the User model.

Endpoints:
  GET  /api/users/                 — list all users (Admin only)
  POST /api/users/                 — create a user (Admin only)
  GET  /api/users/me/              — current user profile (any authenticated)
  GET  /api/users/{id}/            — retrieve user detail (Admin only)
  PATCH /api/users/{id}/           — update user (Admin only)
  PATCH /api/users/{id}/deactivate/ — toggle is_active (Admin only)
"""

from rest_framework import status
from rest_framework.generics import ListCreateAPIView, RetrieveUpdateAPIView
from rest_framework.permissions import IsAuthenticated
from rest_framework.request import Request
from rest_framework.response import Response
from rest_framework.views import APIView

from .models import User
from .permissions import IsAdminUser
from .serializers import (
    UserCreateSerializer,
    UserDetailSerializer,
    UserListSerializer,
    UserUpdateSerializer,
)


class UserListCreateView(ListCreateAPIView):
    """
    GET  /api/users/  — paginated list of all users (Admin only).
    POST /api/users/  — create a new user account (Admin only).
    """

    queryset = User.objects.all().order_by("date_joined")
    permission_classes = [IsAuthenticated, IsAdminUser]

    def get_serializer_class(self):
        if self.request.method == "POST":
            return UserCreateSerializer
        return UserListSerializer


class UserRetrieveUpdateView(RetrieveUpdateAPIView):
    """
    GET   /api/users/{id}/ — retrieve a single user (Admin only).
    PATCH /api/users/{id}/ — partial update of role / department / status (Admin only).
    """

    queryset = User.objects.all()
    permission_classes = [IsAuthenticated, IsAdminUser]
    http_method_names = ["get", "patch", "head", "options"]  # no PUT

    def get_serializer_class(self):
        if self.request.method == "PATCH":
            return UserUpdateSerializer
        return UserDetailSerializer

    def partial_update(self, request: Request, *args, **kwargs) -> Response:
        """Force partial=True so all fields are optional on PATCH."""
        kwargs["partial"] = True
        return super().update(request, *args, **kwargs)


class UserDeactivateView(APIView):
    """
    PATCH /api/users/{id}/deactivate/
    Toggles the ``is_active`` flag for the target user (Admin only).
    Returns the updated user detail.
    """

    permission_classes = [IsAuthenticated, IsAdminUser]

    def patch(self, request: Request, pk: int) -> Response:
        """Toggle is_active on the target user."""
        try:
            user = User.objects.get(pk=pk)
        except User.DoesNotExist:
            return Response({"detail": "User not found."}, status=status.HTTP_404_NOT_FOUND)

        # Prevent admin from deactivating themselves
        if user == request.user:
            return Response(
                {"detail": "You cannot deactivate your own account."},
                status=status.HTTP_400_BAD_REQUEST,
            )

        user.is_active = not user.is_active
        user.save(update_fields=["is_active"])

        serializer = UserDetailSerializer(user)
        return Response(serializer.data, status=status.HTTP_200_OK)


class MeView(APIView):
    """
    GET /api/users/me/
    Returns the profile of the currently authenticated user.
    Accessible by any authenticated user regardless of role.
    """

    permission_classes = [IsAuthenticated]

    def get(self, request: Request) -> Response:
        """Return the authenticated user's profile."""
        serializer = UserDetailSerializer(request.user)
        return Response(serializer.data)
