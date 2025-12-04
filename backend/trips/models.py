from django.db import models
from django.utils import timezone
from employees.models import Employee  # Import the Employee model
from customers.models import Customer  # Import the Customer model
from locations.models import Location  # Import the Location model
from trucks.models import Truck        # Import the Truck model

# --- ENUM Definitions ---

# Matches trip_status ENUM in Database.txt [cite: 9]
class TripStatus(models.TextChoices):
    SCHEDULED = 'Scheduled', 'Scheduled'
    IN_TRANSIT = 'In Transit', 'In Transit'
    COMPLETED = 'Completed', 'Completed'
    CANCELLED = 'Cancelled', 'Cancelled'
    RESCUE = 'Rescue', 'Rescue'
    BACKLOAD = 'Backload', 'Backload'

# Matches load_type ENUM in Database.txt [cite: 10]
class LoadType(models.TextChoices):
    DRY = 'Dry', 'Dry'
    CHILLED = 'Chilled', 'Chilled'
    REF = 'Ref', 'Ref'
    COMBI = 'Combi', 'Combi'

# Matches event_type ENUM in Database.txt [cite: 10]
class EventType(models.TextChoices):
    LOADING_ARRIVAL = 'Loading_Arrival', 'Loading Arrival'
    LOADING_START = 'Loading_Start', 'Loading Start'
    UNLOADING_FINISH = 'Unloading_Finish', 'Unloading Finish'

# --- Trip Model (Transactional Table) ---

class Trip(models.Model):
    # trip_id SERIAL PRIMARY KEY
    trip_id = models.AutoField(primary_key=True)
    
    # trip_code VARCHAR(50) NOT NULL UNIQUE
    trip_code = models.CharField(max_length=50, unique=True, null=False)
    
    # customer_id INT REFERENCES customers(customer_id)
    customer = models.ForeignKey(Customer, on_delete=models.SET_NULL, null=True, related_name='trips')
    
    # truck_id INT REFERENCES trucks(truck_id)
    truck = models.ForeignKey(Truck, on_delete=models.SET_NULL, null=True, related_name='trips')
    
    # driver_id INT REFERENCES employees(employee_id)
    driver = models.ForeignKey(Employee, on_delete=models.SET_NULL, null=True, related_name='driven_trips')
    
    # helper1_id INT REFERENCES employees(employee_id)
    helper1 = models.ForeignKey(Employee, on_delete=models.SET_NULL, null=True, blank=True, related_name='helped_trips_1')
    
    # helper2_id INT REFERENCES employees(employee_id)
    helper2 = models.ForeignKey(Employee, on_delete=models.SET_NULL, null=True, blank=True, related_name='helped_trips_2')
    
    # origin_location_id INT REFERENCES locations(location_id)
    origin_location = models.ForeignKey(Location, on_delete=models.SET_NULL, null=True, related_name='origin_trips')
    
    # destination_location_id INT REFERENCES locations(location_id)
    destination_location = models.ForeignKey(Location, on_delete=models.SET_NULL, null=True, related_name='destination_trips')
    
    # scheduled_start_time TIMESTAMP WITH TIME ZONE NOT NULL
    scheduled_start_time = models.DateTimeField(null=False)
    
    # status trip_status DEFAULT 'Scheduled'
    status = models.CharField(
        max_length=50,
        choices=TripStatus.choices,
        default=TripStatus.SCHEDULED
    )
    
    # load_type load_type DEFAULT 'Dry'
    load_type = models.CharField(
        max_length=50,
        choices=LoadType.choices,
        default=LoadType.DRY
    )
    
    # loading_ref_no VARCHAR(100)
    loading_ref_no = models.CharField(max_length=100, null=True, blank=True)
    
    # net_weight NUMERIC(10, 2)
    net_weight = models.DecimalField(max_digits=10, decimal_places=2, null=True, blank=True)
    
    # created_at, updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
    created_at = models.DateTimeField(default=timezone.now, editable=False)
    updated_at = models.DateTimeField(auto_now=True)

    class Meta:
        # CRUCIAL: Maps model to the 'trips' table name [cite: 16]
        db_table = 'trips'
        verbose_name = 'Trip'
        verbose_name_plural = 'Trips'
        # Add indexes for performance [cite: 20, 21]
        indexes = [
            models.Index(fields=['status'], name='idx_trips_status'),
            models.Index(fields=['scheduled_start_time'], name='idx_trips_scheduled_date'),
            models.Index(fields=['customer'], name='idx_trips_customer'),
        ]

    def __str__(self):
        return self.trip_code

# --- TripEvent Model (Logging Table) ---

class TripEvent(models.Model):
    # event_id SERIAL PRIMARY KEY
    event_id = models.AutoField(primary_key=True)
    
    # trip_id INT REFERENCES trips(trip_id) ON DELETE CASCADE
    trip = models.ForeignKey(Trip, on_delete=models.CASCADE, related_name='events')
    
    # encoder_id INT REFERENCES employees(employee_id)
    encoder = models.ForeignKey(Employee, on_delete=models.SET_NULL, null=True, related_name='encoded_events')
    
    # event_type event_type NOT NULL
    event_type = models.CharField(
        max_length=50,
        choices=EventType.choices,
        null=False
    )
    
    # event_timestamp TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
    event_timestamp = models.DateTimeField(default=timezone.now)
    
    # document_no VARCHAR(100)
    document_no = models.CharField(max_length=100, null=True, blank=True)

    class Meta:
        # CRUCIAL: Maps model to the 'trip_events' table name [cite: 18]
        db_table = 'trip_events'
        verbose_name = 'Trip Event'
        verbose_name_plural = 'Trip Events'

# --- TripFuel Model (Logging Table) ---

class TripFuel(models.Model):
    # fuel_id SERIAL PRIMARY KEY
    fuel_id = models.AutoField(primary_key=True)
    
    # trip_id INT REFERENCES trips(trip_id) ON DELETE CASCADE
    trip = models.ForeignKey(Trip, on_delete=models.CASCADE, related_name='fuels')
    
    # encoder_id INT REFERENCES employees(employee_id)
    encoder = models.ForeignKey(Employee, on_delete=models.SET_NULL, null=True, related_name='encoded_fuels')
    
    # fuel_ref_no VARCHAR(100)
    fuel_ref_no = models.CharField(max_length=100, null=True, blank=True)
    
    # liters NUMERIC(8, 2) NOT NULL
    liters = models.DecimalField(max_digits=8, decimal_places=2, null=False)
    
    # total_amount NUMERIC(10, 2) NOT NULL
    total_amount = models.DecimalField(max_digits=10, decimal_places=2, null=False)
    
    # created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
    created_at = models.DateTimeField(default=timezone.now, editable=False)

    class Meta:
        # CRUCIAL: Maps model to the 'trip_fuels' table name [cite: 19]
        db_table = 'trip_fuels'
        verbose_name = 'Trip Fuel'
        verbose_name_plural = 'Trip Fuels'