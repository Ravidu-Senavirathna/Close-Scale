from django.contrib.auth.models import AbstractUser
from django.db import models
from django.utils.translation import gettext_lazy as _

class User(AbstractUser):
    class Role(models.TextChoices):
        SALES_REP = 'SALES_REP', _('Sales Representative')
        MANAGER = 'MANAGER', _('Manager')
        CEO = 'CEO', _('CEO / Directors')
        ADMIN = 'ADMIN', _('Administrator')

    class Department(models.TextChoices):
        SALES = 'SALES', _('Sales')
        PROJECTS = 'PROJECTS', _('Projects')

    role = models.CharField(
        max_length=20,
        choices=Role.choices,
        default=Role.SALES_REP,
        help_text=_('The functional role of the user.')
    )
    department = models.CharField(
        max_length=20,
        choices=Department.choices,
        blank=True,
        null=True,
        help_text=_('Required if the user is a Manager.')
    )

    def __str__(self):
        if self.role == self.Role.MANAGER and self.department:
            return f"{self.username} ({self.get_role_display()} - {self.get_department_display()})"
        return f"{self.username} ({self.get_role_display()})"
