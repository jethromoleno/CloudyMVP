from django.db import models
from django.utils import timezone

# Matches employee_role ENUM in Database.txt
class EmployeeRole(models.TextChoices):
    DRIVER = 'Driver', 'Driver'
    HELPER = 'Helper', 'Helper'
    ENCODER = 'Encoder', 'Encoder'

class Employee(models.Model):
    # employee_id SERIAL PRIMARY KEY
    employee_id = models.AutoField(primary_key=True) 
    
    # first_name VARCHAR(100) NOT NULL
    first_name = models.CharField(max_length=100)
    
    # last_name VARCHAR(100) NOT NULL
    last_name = models.CharField(max_length=100)
    
    # role employee_role NOT NULL
    role = models.CharField(
        max_length=50,
        choices=EmployeeRole.choices,
        null=False
    )
    
    # license_number VARCHAR(50) (Nullable)
    license_number = models.CharField(max_length=50, null=True, blank=True)
    
    # is_active BOOLEAN DEFAULT TRUE
    is_active = models.BooleanField(default=True)

    class Meta:
        # CRUCIAL: Maps model to the 'employees' table name
        db_table = 'employees'
        verbose_name = 'Employee'
        verbose_name_plural = 'Employees'

    def __str__(self):
        return f"{self.first_name} {self.last_name} ({self.role})"