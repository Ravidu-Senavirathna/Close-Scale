"""
DRF serializers for the User model.

Serializer variants:
  - UserListSerializer      — lightweight, for list views
  - UserDetailSerializer    — full detail, for retrieve/me endpoint
  - UserCreateSerializer    — Admin creates a new user with a temp password
  - UserUpdateSerializer    — Admin updates role / department / active status
"""

from django.contrib.auth.password_validation import validate_password
from rest_framework import serializers

from .models import User


class UserListSerializer(serializers.ModelSerializer):
    """Compact serializer used in paginated list responses."""

    full_name = serializers.CharField(read_only=True)

    class Meta:
        model = User
        fields = [
            "id",
            "username",
            "email",
            "full_name",
            "role",
            "is_active",
        ]


class UserDetailSerializer(serializers.ModelSerializer):
    """Full serializer used for the retrieve / me endpoint."""

    full_name = serializers.CharField(read_only=True)

    class Meta:
        model = User
        fields = [
            "id",
            "username",
            "email",
            "first_name",
            "last_name",
            "full_name",
            "role",
            "is_active",
            "is_staff",
            "date_joined",
            "last_login",
        ]
        read_only_fields = ["id", "date_joined", "last_login", "is_staff"]


class UserCreateSerializer(serializers.ModelSerializer):
    """
    Used by Admins to create new user accounts.

    No longer requires a password. Account is created with an unusable
    password, and the user must activate it via an email link.
    Validates the role/department invariant via the model's ``clean()``.
    """

    class Meta:
        model = User
        fields = [
            "username",
            "email",
            "first_name",
            "last_name",
            "role",
        ]

    def create(self, validated_data: dict) -> User:
        """Create the user with an unusable password."""
        user: User = User(**validated_data)
        user.set_unusable_password()
        # Call save() which triggers full_clean() via our override
        user.save()
        return user

class UserUpdateSerializer(serializers.ModelSerializer):
    """
    Admin-only partial-update serializer.
    Allows changing role, department, active status, and name fields.
    Password changes are handled by a separate endpoint.
    """

    class Meta:
        model = User
        fields = [
            "first_name",
            "last_name",
            "role",
            "is_active",
        ]

class ActivateResetSerializer(serializers.Serializer):
    """Serializer for account activation and password resets."""

    uid = serializers.CharField(required=True)
    token = serializers.CharField(required=True)
    new_password = serializers.CharField(
        write_only=True,
        required=True,
        style={"input_type": "password"},
        validators=[validate_password],
    )


class ForgotPasswordSerializer(serializers.Serializer):
    """Serializer for forgot password requests."""

    email = serializers.EmailField(required=True)


class ChangePasswordSerializer(serializers.Serializer):
    """Serializer for an authenticated user changing their own password."""

    current_password = serializers.CharField(
        write_only=True, required=True, style={"input_type": "password"}
    )
    new_password = serializers.CharField(
        write_only=True,
        required=True,
        style={"input_type": "password"},
        validators=[validate_password],
    )

