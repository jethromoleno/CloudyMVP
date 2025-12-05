# backend/analytics/views.py

from rest_framework.views import APIView
from rest_framework.response import Response
from trips.models import Trip
from trucks.models import Truck
from django.db.models import Sum, Count, Q
from django.utils import timezone
from datetime import timedelta

class DashboardAnalyticsView(APIView):
    """
    Returns required KPIs and time-series data for the dashboard.
    GET /api/analytics/dashboard/
    """
    
    def get(self, request, *args, **kwargs):
        # Define the time range for current metrics (e.g., last 30 days)
        thirty_days_ago = timezone.now() - timedelta(days=30)
        
        # --- 1. Calculate Core KPIs ---
        
        # Total Fuel Cost (Requires a 'fuel_cost' field on Trip model)
        # Assuming you implemented a 'fuel_cost' field on the Trip model
        fuel_cost_result = Trip.objects.filter(
            actual_end_time__gte=thirty_days_ago
        ).aggregate(
            total_fuel_cost=Sum('estimated_fuel_cost')
        )
        total_fuel_cost = fuel_cost_result['total_fuel_cost'] or 0.00
        
        # Active, Scheduled, and Completed Trip Counts
        active_trips_count = Trip.objects.filter(status='In Transit').count()
        scheduled_trips_count = Trip.objects.filter(status='Scheduled').count()
        
        # Trucks Under Maintenance (Requires a 'status' field on the Truck model)
        # Assuming your Truck model has a 'status' field where 'Maintenance' is a value
        maintenance_trucks_count = Truck.objects.filter(status='Maintenance').count()
        
        # --- 2. Generate Trip Time-Series Data (Trips Completed per Day) ---
        
        # We look at completed trips for the last 30 days
        completed_trips_data = Trip.objects.filter(
            status='Completed', 
            actual_end_time__gte=thirty_days_ago
        ).extra({'day': "date(actual_end_time)"}).values('day').annotate(count=Count('trip_id')).order_by('day')
        
        # Format for frontend consumption (e.g., a list of dictionaries)
        trip_time_series = [
            {'date': item['day'], 'trips_completed': item['count']}
            for item in completed_trips_data
        ]

        # --- 3. Compile and Return Response ---
        
        dashboard_data = {
            # Required KPIs from the project summary
            "total_fuel_cost": round(total_fuel_cost, 2),
            "active_trips": active_trips_count,
            "scheduled_trips": scheduled_trips_count,
            "maintenance_trucks": maintenance_trucks_count,
            
            # Time-series data
            "trip_time_series": trip_time_series,
            
            # Other useful context (optional)
            "total_trips_last_30_days": Trip.objects.filter(
                Q(scheduled_start_time__gte=thirty_days_ago) | Q(actual_start_time__gte=thirty_days_ago)
            ).count()
        }

        return Response(dashboard_data)