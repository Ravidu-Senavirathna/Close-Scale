from django.contrib.auth.models import AbstractUser
from django.core.exceptions import ValidationError
from django.db import models
from django.utils.translation import gettext_lazy as _
from .managers import UserManager


class User(AbstractUser):
    """
    Custom user model for Close-Scale (Altrium CRM).

    Extends AbstractUser with a ``role`` field.
    """

    class Role(models.TextChoices):
        SALES_REP = "SALES_REP", _("Sales Representative")
        SALES_MANAGER = "SALES_MANAGER", _("Sales Manager")
        PROJECT_MANAGER = "PROJECT_MANAGER", _("Project Manager")
        CEO = "CEO", _("CEO / Directors")
        ADMIN = "ADMIN", _("Administrator")

    objects = UserManager()

    role = models.CharField(
        max_length=20,
        choices=Role.choices,
        default=Role.SALES_REP,
        help_text=_("The functional role of the user."),
    )

    phone_number = models.CharField(
        max_length=20,
        blank=True,
        null=True,
        help_text=_("The user's contact phone number."),
    )

    # ── Convenience property ──────────────────────────────────────────
    @property
    def full_name(self) -> str:
        """Return the user's full name, falling back to username."""
        return self.get_full_name() or self.username

    # ── Validation ────────────────────────────────────────────────────
    def clean(self) -> None:
        super().clean()

    def save(self, *args, **kwargs) -> None:
        """Call full_clean() to trigger model-level validation on every save."""
        self.full_clean()
        super().save(*args, **kwargs)

    # ── String representation ─────────────────────────────────────────
    def __str__(self) -> str:
        return f"{self.username} ({self.get_role_display()})"
