# pyrefly: ignore [missing-import]
from django.urls import path
# pyrefly: ignore [missing-import]
from . import views

urlpatterns = [
    path("", views.home, name="home"),
    path("health/", views.health_check, name="health-check"),
]
