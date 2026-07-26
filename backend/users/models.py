from django.contrib.auth.models import AbstractUser
from django.core.exceptions import ValidationError
from django.db import models
from django.utils.translation import gettext_lazy as _


class User(AbstractUser):
    """
    Custom user model for Close-Scale (Altrium CRM).

    Extends AbstractUser with a ``role`` and an optional ``department`` field.
    The ``department`` field is only meaningful (and enforced) when
    ``role == MANAGER``; it is cleared automatically for all other roles.
    """

    class Role(models.TextChoices):
        SALES_REP = "SALES_REP", _("Sales Representative")
        MANAGER = "MANAGER", _("Manager")
        CEO = "CEO", _("CEO / Directors")
        ADMIN = "ADMIN", _("Administrator")

    class Department(models.TextChoices):
        SALES = "SALES", _("Sales")
        PROJECTS = "PROJECTS", _("Projects")

    role = models.CharField(
        max_length=20,
        choices=Role.choices,
        default=Role.SALES_REP,
        help_text=_("The functional role of the user."),
    )
    department = models.CharField(
        max_length=20,
        choices=Department.choices,
        blank=True,
        null=True,
        help_text=_("Required when role is Manager; must be blank for all other roles."),
    )

    # ── Convenience property ──────────────────────────────────────────
    @property
    def full_name(self) -> str:
        """Return the user's full name, falling back to username."""
        return self.get_full_name() or self.username

    # ── Validation ────────────────────────────────────────────────────
    def clean(self) -> None:
        """
        Enforce the department / role invariant:
        - Managers MUST have a department.
        - All other roles MUST NOT have a department.
        """
        super().clean()
        if self.role == self.Role.MANAGER:
            if not self.department:
                raise ValidationError(
                    {"department": _("A department (Sales or Projects) is required for Managers.")}
                )
        else:
            # Silently clear department for non-Manager roles so the
            # invariant is always satisfied even if a stale value is present.
            self.department = None

    def save(self, *args, **kwargs) -> None:
        """Call full_clean() to trigger model-level validation on every save."""
        self.full_clean()
        super().save(*args, **kwargs)

    # ── String representation ─────────────────────────────────────────
    def __str__(self) -> str:
        if self.role == self.Role.MANAGER and self.department:
            return (
                f"{self.username} ({self.get_role_display()} — {self.get_department_display()})"
            )
        return f"{self.username} ({self.get_role_display()})"
