from django.contrib.auth.models import UserManager as BaseUserManager

class UserManager(BaseUserManager):
    """
    Custom user manager for Close-Scale.
    Ensures that newly created superusers automatically get the ADMIN role.
    """
    
    def create_superuser(self, username, email=None, password=None, **extra_fields):
        extra_fields.setdefault('is_staff', True)
        extra_fields.setdefault('is_superuser', True)

        if extra_fields.get('is_staff') is not True:
            raise ValueError('Superuser must have is_staff=True.')
        if extra_fields.get('is_superuser') is not True:
            raise ValueError('Superuser must have is_superuser=True.')

        # Automatically assign the ADMIN role
        extra_fields.setdefault('role', self.model.Role.ADMIN)

        return self._create_user(username, email, password, **extra_fields)
