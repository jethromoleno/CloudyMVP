# trips/urls.py

from django.urls import include, path
from rest_framework.routers import DefaultRouter
from .views import TripViewSet

router = DefaultRouter()
# This registers the TripViewSet and creates routes like:
# /api/trips/
router.register(r'trips', TripViewSet, basename='trip')

urlpatterns = [
    # Includes: /api/trips/, /api/trips/{id}/
    path('', include(router.urls)), 
    # The custom action set_status is automatically routed as: 
    # PATCH /api/trips/{id}/status/
]