# /backend/core/urls.py
from django.contrib import admin
from django.urls import path, include
from django.conf import settings
from django.conf.urls.static import static


urlpatterns = [
    # Default Django Admin Interface
    path('admin/', admin.site.urls),

    # --- API Routes ---

    # Accounts/Authentication routes (e.g., /api/auth/login, /api/auth/token/refresh)
    path('api/auth/', include('accounts.urls')),

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
    path('api/trips/', include('trips.urls')),

    # Analytics Routes
    path('api/analytics/', include('analytics.urls')),
]

if settings.DEBUG:
    urlpatterns += static(settings.STATIC_URL, document_root=settings.STATIC_ROOT)