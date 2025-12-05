# trucks/models.py (UPDATED CODE)

from django.db import models
from accounts.models import FMSUser # 👈 NEW: Import the custom user model

# Matches truck_status ENUM in Database.txt
class TruckStatus(models.TextChoices):
    AVAILABLE = 'Available', 'Available'
    IN_USE = 'In Use', 'In Use'
    MAINTENANCE = 'Maintenance', 'Maintenance'

class Truck(models.Model):
    # truck_id SERIAL PRIMARY KEY
    truck_id = models.AutoField(primary_key=True) 
    
    # license_plate VARCHAR(20) NOT NULL UNIQUE
    license_plate = models.CharField(max_length=20, unique=True, null=False)
    
    # vin VARCHAR(50)
    vin = models.CharField(max_length=50, null=True, blank=True)
    
    # tonner_capacity SMALLINT NOT NULL
    tonner_capacity = models.SmallIntegerField(null=False)
    
    # status truck_status DEFAULT 'Available'
    status = models.CharField(
        max_length=50,
        choices=TruckStatus.choices,
        default=TruckStatus.AVAILABLE
    )

    # 🚨 CRITICAL ADDITION: Foreign key to the FMSUser model (Driver)
    assigned_driver = models.ForeignKey(
        FMSUser, 
        on_delete=models.SET_NULL, # If the driver is deleted, unassign the truck (set to NULL)
        related_name='trucks',     # Allows access via driver.trucks.all()
        null=True,                 # Allows trucks to be unassigned
        blank=True,
        verbose_name='Assigned Driver'
    )
    
    class Meta:
        # CRUCIAL: Maps model to the 'trucks' table name
        db_table = 'trucks'
        verbose_name = 'Truck'
        verbose_name_plural = 'Trucks'
        indexes = [
            models.Index(fields=['status'], name='idx_trucks_status')
        ]

    def __str__(self):
        return self.license_plate