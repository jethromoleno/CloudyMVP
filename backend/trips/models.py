# trips/models.py

from django.db import models
from trucks.models import Truck 
from django.contrib.auth import get_user_model
from django.utils import timezone # For the created_at timestamp

User = get_user_model() 

STATUS_CHOICES = (
    ('Scheduled', 'Scheduled'),
    ('In Transit', 'In Transit'),
    ('Completed', 'Completed'),
    ('Canceled', 'Canceled'),
)

class Trip(models.Model):
    # --- REQUIRED EXISTING FIELDS (from database schema) ---
    # Assuming this is your existing primary key:
    trip_id = models.AutoField(primary_key=True) 
    
    # Assuming this unique code exists:
    trip_code = models.CharField(max_length=50, unique=True, null=True, default=None)
    
    # Assuming these fields exist:
    net_weight = models.DecimalField(max_digits=10, decimal_places=2, null=True, blank=True)
    created_at = models.DateTimeField(default=timezone.now, editable=False)
    
    # --- NEW FIELDS FOR SCHEDULING SYSTEM ---
    
    # Foreign Key to the assigned vehicle (Truck)
    truck = models.ForeignKey(Truck, on_delete=models.SET_NULL, null=True, related_name='trips') 
    
    # Foreign Key to the assigned driver (FMSUser)
    assigned_driver = models.ForeignKey(User, on_delete=models.SET_NULL, null=True, related_name='driven_trips')

    # Trip details
    start_location = models.CharField(max_length=255)
    end_location = models.CharField(max_length=255)
    
    # Scheduling/Status
    scheduled_start_time = models.DateTimeField(null=True, blank=True) # Making nullable to avoid migration prompt
    actual_start_time = models.DateTimeField(null=True, blank=True)
    actual_end_time = models.DateTimeField(null=True, blank=True)
    status = models.CharField(max_length=50, default='Scheduled') 
    
    # Analytics Data
    estimated_fuel_cost = models.DecimalField(max_digits=10, decimal_places=2, null=True, blank=True)
    distance_km = models.DecimalField(max_digits=10, decimal_places=2, null=True, blank=True)

    def __str__(self):
        return f"Trip {self.trip_code} to {self.end_location} ({self.status})"

    class Meta:
        db_table = 'trips'