# trucks/urls.py

from rest_framework.routers import DefaultRouter
from .views import TruckViewSet

router = DefaultRouter()
# This registers the TruckViewSet and creates routes like:
# /api/trucks/
# /api/trucks/{pk}/
router.register(r'', TruckViewSet, basename='truck')

# The router provides the complete urlpatterns
urlpatterns = router.urls