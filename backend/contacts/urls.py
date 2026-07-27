from django.urls import path, include
from rest_framework.routers import DefaultRouter
from .views import OrganizationViewSet, ContactViewSet

router = DefaultRouter()
router.register(r'organizations', OrganizationViewSet, basename='organization')
router.register(r'contacts', ContactViewSet, basename='contact')

urlpatterns = [
    path('', include(router.urls)),
]
