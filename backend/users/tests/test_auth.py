import pytest
from django.urls import reverse
from django.core import mail
from rest_framework import status
from rest_framework.test import APIClient
from django.contrib.auth import get_user_model
from django.contrib.auth.tokens import default_token_generator
from django.utils.encoding import force_bytes
from django.utils.http import urlsafe_base64_encode

User = get_user_model()

@pytest.fixture
def api_client():
    return APIClient()

@pytest.fixture
def admin_user():
    return User.objects.create_superuser(
        username="admin", 
        email="admin@test.com", 
        password="password123",
        role=User.Role.ADMIN
    )

@pytest.fixture
def active_user():
    user = User.objects.create_user(
        username="testuser",
        email="testuser@test.com",
        password="password123",
        role=User.Role.SALES_REP
    )
    return user

@pytest.fixture
def inactive_user():
    user = User.objects.create_user(
        username="newuser",
        email="newuser@test.com",
        role=User.Role.SALES_REP
    )
    user.set_unusable_password()
    user.save()
    return user

@pytest.mark.django_db
class TestAuthenticationFlows:

    def test_admin_create_user_sends_activation_email(self, api_client, admin_user):
        api_client.force_authenticate(user=admin_user)
        url = reverse("user-list-create")
        
        data = {
            "username": "employee",
            "email": "employee@test.com",
            "first_name": "Emp",
            "last_name": "Loyee",
            "role": "SALES_REP"
        }
        
        response = api_client.post(url, data)
        assert response.status_code == status.HTTP_201_CREATED
        
        user = User.objects.get(username="employee")
        assert not user.has_usable_password()
        
        assert len(mail.outbox) == 1
        email = mail.outbox[0]
        assert "Activate Your Account" in email.subject
        assert user.email in email.to

    def test_activate_account(self, api_client, inactive_user):
        url = reverse("activate-account")
        uid = urlsafe_base64_encode(force_bytes(inactive_user.pk))
        token = default_token_generator.make_token(inactive_user)
        
        data = {
            "uid": uid,
            "token": token,
            "new_password": "NewSecurePassword123!"
        }
        
        response = api_client.post(url, data)
        assert response.status_code == status.HTTP_200_OK
        
        inactive_user.refresh_from_db()
        assert inactive_user.has_usable_password()
        assert inactive_user.check_password("NewSecurePassword123!")
        
        # Token should now be invalid
        assert not default_token_generator.check_token(inactive_user, token)

    def test_forgot_password_sends_email(self, api_client, active_user):
        url = reverse("forgot-password")
        
        data = {"email": active_user.email}
        response = api_client.post(url, data)
        
        assert response.status_code == status.HTTP_200_OK
        assert len(mail.outbox) == 1
        assert "Password Reset Request" in mail.outbox[0].subject

    def test_forgot_password_nonexistent_email(self, api_client):
        url = reverse("forgot-password")
        
        data = {"email": "nobody@test.com"}
        response = api_client.post(url, data)
        
        # Should still return 200 to prevent enumeration
        assert response.status_code == status.HTTP_200_OK
        assert len(mail.outbox) == 0

    def test_reset_password(self, api_client, active_user):
        url = reverse("reset-password")
        uid = urlsafe_base64_encode(force_bytes(active_user.pk))
        token = default_token_generator.make_token(active_user)
        
        data = {
            "uid": uid,
            "token": token,
            "new_password": "AnotherSecurePassword123!"
        }
        
        response = api_client.post(url, data)
        assert response.status_code == status.HTTP_200_OK
        
        active_user.refresh_from_db()
        assert active_user.check_password("AnotherSecurePassword123!")
        
        # Token should now be invalid
        assert not default_token_generator.check_token(active_user, token)

    def test_change_password(self, api_client, active_user):
        url = reverse("change-password")
        api_client.force_authenticate(user=active_user)
        
        data = {
            "current_password": "password123",
            "new_password": "ChangedSecurePassword123!"
        }
        
        response = api_client.post(url, data)
        assert response.status_code == status.HTTP_200_OK
        
        active_user.refresh_from_db()
        assert active_user.check_password("ChangedSecurePassword123!")

    def test_change_password_invalid_current(self, api_client, active_user):
        url = reverse("change-password")
        api_client.force_authenticate(user=active_user)
        
        data = {
            "current_password": "wrongpassword",
            "new_password": "ChangedSecurePassword123!"
        }
        
        response = api_client.post(url, data)
        assert response.status_code == status.HTTP_400_BAD_REQUEST

    def test_admin_trigger_reset(self, api_client, admin_user, active_user):
        url = reverse("admin-trigger-reset", kwargs={"pk": active_user.pk})
        api_client.force_authenticate(user=admin_user)
        
        response = api_client.post(url)
        assert response.status_code == status.HTTP_200_OK
        
        assert len(mail.outbox) == 1
        assert "Password Reset Request" in mail.outbox[0].subject
        assert active_user.email in mail.outbox[0].to
