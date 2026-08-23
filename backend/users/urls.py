"""URL patterns for the users app."""

from django.urls import path

from .views import (
    AdminTriggerResetView,
    MeView,
    SalesRepsView,
    UserListCreateView,
    UserRetrieveUpdateView,
)

urlpatterns = [
    # Current user profile — must come before <int:pk> to avoid shadowing
    path("me/", MeView.as_view(), name="user-me"),
    path("sales-reps/", SalesRepsView.as_view(), name="user-sales-reps"),
    # Admin CRUD
    path("", UserListCreateView.as_view(), name="user-list-create"),
    path("<int:pk>/", UserRetrieveUpdateView.as_view(), name="user-detail"),
    path("<int:pk>/reset-password/", AdminTriggerResetView.as_view(), name="admin-trigger-reset"),
]
