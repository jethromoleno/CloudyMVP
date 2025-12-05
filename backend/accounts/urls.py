from django.urls import path

# Import the necessary JWT views
from rest_framework_simplejwt.views import (
    TokenObtainPairView, 
    TokenRefreshView,
)


urlpatterns = [
    # Mapped to /api/auth/login/
    path('login/', TokenObtainPairView.as_view(), name='token_obtain_pair'),
    
    # Mapped to /api/auth/refresh/
    path('refresh/', TokenRefreshView.as_view(), name='token_refresh'),
    
    # Other paths like 'register/', 'user/', etc., will be added here later
]