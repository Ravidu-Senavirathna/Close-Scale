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
    ActivateResetSerializer,
    ForgotPasswordSerializer,
    ChangePasswordSerializer,
)
from .services import send_activation_email, send_password_reset_email
from django.utils.http import urlsafe_base64_decode
from django.utils.encoding import force_str
from django.contrib.auth.tokens import default_token_generator



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

    def perform_create(self, serializer):
        """Create the user and send an activation email."""
        user = serializer.save()
        send_activation_email(user)

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


class ActivateAccountView(APIView):
    """
    POST /api/auth/activate/
    Activates an account by setting the initial password.
    """
    permission_classes = []

    def post(self, request: Request) -> Response:
        serializer = ActivateResetSerializer(data=request.data)
        serializer.is_valid(raise_exception=True)
        
        uid = serializer.validated_data["uid"]
        token = serializer.validated_data["token"]
        new_password = serializer.validated_data["new_password"]
        
        try:
            uid = force_str(urlsafe_base64_decode(uid))
            user = User.objects.get(pk=uid)
        except (TypeError, ValueError, OverflowError, User.DoesNotExist):
            return Response({"detail": "Invalid or expired token."}, status=status.HTTP_400_BAD_REQUEST)
        
        if not default_token_generator.check_token(user, token):
            return Response({"detail": "Invalid or expired token."}, status=status.HTTP_400_BAD_REQUEST)
            
        user.set_password(new_password)
        user.save()
        return Response({"detail": "Account activated successfully."}, status=status.HTTP_200_OK)


class ForgotPasswordView(APIView):
    """
    POST /api/auth/forgot-password/
    Sends a password reset email if the account exists.
    """
    permission_classes = []

    def post(self, request: Request) -> Response:
        serializer = ForgotPasswordSerializer(data=request.data)
        serializer.is_valid(raise_exception=True)
        
        email = serializer.validated_data["email"]
        try:
            user = User.objects.get(email__iexact=email)
            send_password_reset_email(user)
        except User.DoesNotExist:
            pass  # Do not reveal whether email exists
            
        return Response(
            {"detail": "If an account with that email exists, we have sent a reset link."},
            status=status.HTTP_200_OK
        )


class ResetPasswordView(APIView):
    """
    POST /api/auth/reset-password/
    Sets a new password from a forgotten password link.
    """
    permission_classes = []

    def post(self, request: Request) -> Response:
        serializer = ActivateResetSerializer(data=request.data)
        serializer.is_valid(raise_exception=True)
        
        uid = serializer.validated_data["uid"]
        token = serializer.validated_data["token"]
        new_password = serializer.validated_data["new_password"]
        
        try:
            uid = force_str(urlsafe_base64_decode(uid))
            user = User.objects.get(pk=uid)
        except (TypeError, ValueError, OverflowError, User.DoesNotExist):
            return Response({"detail": "Invalid or expired token."}, status=status.HTTP_400_BAD_REQUEST)
        
        if not default_token_generator.check_token(user, token):
            return Response({"detail": "Invalid or expired token."}, status=status.HTTP_400_BAD_REQUEST)
            
        user.set_password(new_password)
        user.save()
        return Response({"detail": "Password reset successfully."}, status=status.HTTP_200_OK)


class ChangePasswordView(APIView):
    """
    POST /api/auth/change-password/
    Authenticated user changes their own password.
    """
    permission_classes = [IsAuthenticated]

    def post(self, request: Request) -> Response:
        serializer = ChangePasswordSerializer(data=request.data)
        serializer.is_valid(raise_exception=True)
        
        current_password = serializer.validated_data["current_password"]
        new_password = serializer.validated_data["new_password"]
        
        if not request.user.check_password(current_password):
            return Response({"current_password": ["Invalid password."]}, status=status.HTTP_400_BAD_REQUEST)
            
        request.user.set_password(new_password)
        request.user.save()
        return Response({"detail": "Password changed successfully."}, status=status.HTTP_200_OK)


class AdminTriggerResetView(APIView):
    """
    POST /api/users/{id}/reset-password/
    Admin forcibly initiates a password reset for an employee.
    """
    permission_classes = [IsAuthenticated, IsAdminUser]

    def post(self, request: Request, pk: int) -> Response:
        try:
            user = User.objects.get(pk=pk)
        except User.DoesNotExist:
            return Response({"detail": "User not found."}, status=status.HTTP_404_NOT_FOUND)
            
        send_password_reset_email(user)
        return Response({"detail": "Password reset email sent."}, status=status.HTTP_200_OK)

