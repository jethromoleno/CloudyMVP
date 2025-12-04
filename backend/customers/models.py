from django.db import models
from django.utils import timezone

class Customer(models.Model):
    # customer_id SERIAL PRIMARY KEY
    customer_id = models.AutoField(primary_key=True)
    
    # name VARCHAR(255) NOT NULL
    name = models.CharField(max_length=255)
    
    # contact_name VARCHAR(200)
    contact_name = models.CharField(max_length=200, null=True, blank=True)
    
    # contact_phone VARCHAR(50)
    contact_phone = models.CharField(max_length=50, null=True, blank=True)
    
    # created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
    created_at = models.DateTimeField(default=timezone.now, editable=False)

    class Meta:
        # CRUCIAL: Maps model to the 'customers' table name
        db_table = 'customers'
        verbose_name = 'Customer'
        verbose_name_plural = 'Customers'

    def __str__(self):
        return self.name