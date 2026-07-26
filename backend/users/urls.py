"""URL patterns for the users app."""

from django.urls import path

from .views import MeView, UserDeactivateView, UserListCreateView, UserRetrieveUpdateView

urlpatterns = [
    # Current user profile — must come before <int:pk> to avoid shadowing
    path("me/", MeView.as_view(), name="user-me"),
    # Admin CRUD
    path("", UserListCreateView.as_view(), name="user-list-create"),
    path("<int:pk>/", UserRetrieveUpdateView.as_view(), name="user-detail"),
    path("<int:pk>/deactivate/", UserDeactivateView.as_view(), name="user-deactivate"),
]
