from django.db import models
from django.utils import timezone

class Location(models.Model):
    # location_id SERIAL PRIMARY KEY
    location_id = models.AutoField(primary_key=True)
    
    # name VARCHAR(255) NOT NULL
    name = models.CharField(max_length=255)
    
    # address_line_1 VARCHAR(255)
    address_line_1 = models.CharField(max_length=255, null=True, blank=True)
    
    # city VARCHAR(100)
    city = models.CharField(max_length=100, null=True, blank=True)
    
    # latitude NUMERIC(10, 6)
    latitude = models.DecimalField(max_digits=10, decimal_places=6, null=True, blank=True)
    
    # longitude NUMERIC(10, 6)
    longitude = models.DecimalField(max_digits=10, decimal_places=6, null=True, blank=True)
    
    # is_hub BOOLEAN DEFAULT FALSE
    is_hub = models.BooleanField(default=False)

    class Meta:
        # CRUCIAL: Maps model to the 'locations' table name
        db_table = 'locations'
        verbose_name = 'Location'
        verbose_name_plural = 'Locations'

    def __str__(self):
        return self.name