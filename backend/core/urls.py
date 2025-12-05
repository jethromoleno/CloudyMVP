# /backend/core/urls.py
from django.contrib import admin
from django.urls import path, include
from django.conf import settings
from django.conf.urls.static import static
# core/urls.py (Ensure this is where you registered 'trips')
from rest_framework.routers import DefaultRouter
# Adjust app name/path as needed (e.g., from employees.views)
from employees.views import DriverViewSet
from trips.views import TripViewSet
from trucks.views import TruckViewSet # 👈 New Import



router = DefaultRouter()
router.register(r'trips', TripViewSet, basename='trip') 
# ADD THIS LINE:
router.register(r'drivers', DriverViewSet, basename='driver')
router.register(r'trucks', TruckViewSet, basename='truck')

urlpatterns = [
    # Default Django Admin Interface
    path('admin/', admin.site.urls),

    # --- API Routes ---

    path('api/', include(router.urls)),

    # Accounts/Authentication routes (e.g., /api/auth/login, /api/auth/token/refresh)
    # path('api/auth/', include('accounts.urls')),
    path('api/auth/', include('djoser.urls')),
    path('api/auth/', include('djoser.urls.jwt')),

    # Master Data Routes (Grouped under /api/master for clean organization)
    # Customers
    path('api/master/customers/', include('customers.urls')),
    # Locations
    path('api/master/locations/', include('locations.urls')),
    # Trucks
    path('api/master/trucks/', include('trucks.urls')),
    # Employees
    path('api/master/employees/', include('employees.urls')),
    
    # Transactional Routes
    # Trips (Includes trips, trip_events, trip_fuels)
    # path('api/trips/', include('trips.urls')),

    # Analytics Routes
    path('api/analytics/', include('analytics.urls')),
]

if settings.DEBUG:
    urlpatterns += static(settings.STATIC_URL, document_root=settings.STATIC_ROOT)