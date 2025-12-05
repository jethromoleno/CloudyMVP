# accounts/models.py

from django.contrib.auth.models import AbstractUser
from django.db import models
from django.utils import timezone # 👈 Needed for the created_at field


class FMSUser(AbstractUser):
    """
    Custom User Model based on AbstractUser to retain built-in Django Groups/Permissions.
    - Uses email for login (USERNAME_FIELD).
    - Maps to the required 'system_users' database table.
    """
    
    # 1. OVERRIDE EMAIL FIELD
    # Ensure email is unique and used for login
    email = models.EmailField(unique=True) 

    # 2. ADD CUSTOM FIELD
    # Add the required created_at timestamp field
    created_at = models.DateTimeField(default=timezone.now, editable=False)

    # 3. CONFIGURE AUTH FIELDS
    # Set email as the primary login field
    USERNAME_FIELD = 'email'
    # These fields are prompted when creating a user via createsuperuser
    REQUIRED_FIELDS = ['username'] 

    def __str__(self):
        return self.email

    class Meta:
        # CRUCIAL: Maps the model to the required 'system_users' database table
        db_table = 'system_users'
        verbose_name = 'System User'
        verbose_name_plural = 'System Users'