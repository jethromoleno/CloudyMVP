# trips/serializers.py

from rest_framework import serializers
from django.db.models import Q 
from .models import Trip
# Ensure this import matches your file structure:
from trucks.models import Truck, TruckStatus 
from django.contrib.auth import get_user_model

User = get_user_model() 

class TripSerializer(serializers.ModelSerializer):
    class Meta:
        model = Trip
        fields = '__all__'
        read_only_fields = ('trip_code', 'created_at', 'status') # 'status' is set to 'Scheduled' on creation
    
    def validate(self, data):
        # Only perform these checks on creation (POST) if self.instance is None
        if self.instance is None: 
            
            truck = data.get('truck')
            driver = data.get('assigned_driver')
            # net_weight is in the request data
            net_weight = data.get('net_weight') 
            
            # --- Pre-Check: Ensure required assignments are present ---
            if not truck:
                raise serializers.ValidationError({"truck": "A truck must be assigned to the trip."})
            if not driver:
                raise serializers.ValidationError({"assigned_driver": "A driver must be assigned to the trip."})
            if net_weight is None:
                 raise serializers.ValidationError({"net_weight": "Trip net weight must be provided."})
            
            # --- Check 1: Vehicle Capacity Constraint ---
            # Use the correct field: 'tonner_capacity'
            if net_weight > truck.tonner_capacity:
                raise serializers.ValidationError(
                    f"Trip load ({net_weight} kg) exceeds vehicle capacity ({truck.tonner_capacity} kg)."
                )
                
            # --- Check 2: Vehicle Availability Check ---
            # Use the correct status choices: 'Maintenance'
            if truck.status == TruckStatus.MAINTENANCE:
                raise serializers.ValidationError(
                    f"Assigned truck {truck.license_plate} is under maintenance and cannot be used."
                )

            # --- Check 3: Driver Availability Check ---
            # Statuses indicating an active or scheduled assignment
            active_statuses = ['Scheduled', 'In Transit'] 
            
            # Check for any existing trip that conflicts (is not Completed/Cancelled)
            conflicting_trip_exists = Trip.objects.filter(
                assigned_driver=driver,
                status__in=active_statuses
            ).exists()

            if conflicting_trip_exists:
                raise serializers.ValidationError(
                    "Assigned driver is currently scheduled for or driving another active trip."
                )
                
        return data
    
    def create(self, validated_data):
        # Ensure status is set to 'Scheduled' upon creation
        validated_data['status'] = 'Scheduled'
        return super().create(validated_data)

class TripDetailSerializer(TripSerializer):
    # Use a detail serializer to display human-readable foreign key data.
    truck_license_plate = serializers.ReadOnlyField(source='truck.license_plate')
    driver_email = serializers.ReadOnlyField(source='assigned_driver.email')

    class Meta(TripSerializer.Meta):
        # Explicitly list all fields for detail view
        fields = [
            'trip_id', 'trip_code', 'net_weight', 'created_at', 
            'truck', 'assigned_driver', 
            'start_location', 'end_location', 
            'scheduled_start_time', 'actual_start_time', 'status', 
            'estimated_fuel_cost', 'distance_km',
            'truck_license_plate', 'driver_email', 
        ]
        read_only_fields = TripSerializer.Meta.read_only_fields + ('status',)