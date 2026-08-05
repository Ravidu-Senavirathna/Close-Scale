"""
Services for user authentication flows.
Handles token generation and sending emails.
"""

from django.conf import settings
from django.contrib.auth.tokens import default_token_generator
from django.core.mail import EmailMultiAlternatives
from django.template.loader import render_to_string
from django.utils.encoding import force_bytes
from django.utils.http import urlsafe_base64_encode

from .models import User


def generate_auth_token(user: User) -> tuple[str, str]:
    """Generate a uid and token for the given user."""
    uid = urlsafe_base64_encode(force_bytes(user.pk))
    token = default_token_generator.make_token(user)
    return uid, token


def send_activation_email(user: User) -> None:
    """
    Generate an activation token and send an activation email to the user.
    """
    uid, token = generate_auth_token(user)
    activation_link = f"{settings.FRONTEND_URL}/activate/{uid}/{token}"

    context = {
        "user": user,
        "activation_link": activation_link,
    }

    subject = "Welcome to Close-Scale CRM - Activate Your Account"
    text_content = render_to_string("emails/activation_email.txt", context)
    html_content = render_to_string("emails/activation_email.html", context)

    msg = EmailMultiAlternatives(
        subject=subject,
        body=text_content,
        from_email=settings.DEFAULT_FROM_EMAIL,
        to=[user.email],
    )
    msg.attach_alternative(html_content, "text/html")
    msg.send(fail_silently=False)


def send_password_reset_email(user: User) -> None:
    """
    Generate a reset token and send a password reset email to the user.
    """
    uid, token = generate_auth_token(user)
    reset_link = f"{settings.FRONTEND_URL}/reset-password/{uid}/{token}"

    context = {
        "user": user,
        "reset_link": reset_link,
    }

    subject = "Close-Scale CRM - Password Reset Request"
    text_content = render_to_string("emails/reset_password_email.txt", context)
    html_content = render_to_string("emails/reset_password_email.html", context)

    msg = EmailMultiAlternatives(
        subject=subject,
        body=text_content,
        from_email=settings.DEFAULT_FROM_EMAIL,
        to=[user.email],
    )
    msg.attach_alternative(html_content, "text/html")
    msg.send(fail_silently=False)
