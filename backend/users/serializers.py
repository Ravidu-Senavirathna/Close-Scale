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
            "department",
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
            "department",
            "is_active",
            "is_staff",
            "date_joined",
            "last_login",
        ]
        read_only_fields = ["id", "date_joined", "last_login", "is_staff"]


class UserCreateSerializer(serializers.ModelSerializer):
    """
    Used by Admins to create new user accounts.

    Requires a ``password`` field (write-only).
    Validates the role/department invariant via the model's ``clean()``.
    """

    password = serializers.CharField(
        write_only=True,
        required=True,
        style={"input_type": "password"},
        validators=[validate_password],
    )

    class Meta:
        model = User
        fields = [
            "username",
            "email",
            "first_name",
            "last_name",
            "role",
            "department",
            "password",
        ]

    def validate(self, attrs: dict) -> dict:
        """Enforce the Manager/department rule at the serializer level."""
        role = attrs.get("role", User.Role.SALES_REP)
        department = attrs.get("department")

        if role == User.Role.MANAGER and not department:
            raise serializers.ValidationError(
                {"department": "A department (Sales or Projects) is required for Managers."}
            )
        if role != User.Role.MANAGER and department:
            attrs["department"] = None
        return attrs

    def create(self, validated_data: dict) -> User:
        """Create the user with a properly hashed password."""
        password = validated_data.pop("password")
        user: User = User(**validated_data)
        user.set_password(password)
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
            "department",
            "is_active",
        ]

    def validate(self, attrs: dict) -> dict:
        """Enforce the Manager/department rule on updates."""
        # Merge with existing instance values for partial updates
        role = attrs.get("role", self.instance.role)  # type: ignore[union-attr]
        department = attrs.get("department", self.instance.department)  # type: ignore[union-attr]

        if role == User.Role.MANAGER and not department:
            raise serializers.ValidationError(
                {"department": "A department (Sales or Projects) is required for Managers."}
            )
        if role != User.Role.MANAGER:
            attrs["department"] = None
        return attrs
