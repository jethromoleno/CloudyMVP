# accounts/models.py

from django.db import models
from django.contrib.auth.models import AbstractUser # Adjust base class as needed
from django.utils import timezone # 👈 Needed for the created_at field

class FMSUser(AbstractUser):
    # Define available roles
    USER_ROLES = (
        ('admin', 'Admin'),
        ('dispatcher', 'Dispatcher'),
        ('driver', 'Driver'),
        ('guest', 'Guest'),
    )

    # ADD THIS FIELD (Replaces the need for a separate is_driver field)
    role = models.CharField(
        max_length=20, 
        choices=USER_ROLES, 
        default='guest', # Default new users to guest if not specified
        verbose_name='User Role'
    ) 

    # Keep a property for easy template/code checks
    @property
    def is_driver(self):
        return self.role == 'driver'

    # 🚨 CRITICAL FIXES FOR INHERITED FIELDS
    first_name = models.CharField(max_length=150, blank=True, null=True)
    last_name = models.CharField(max_length=150, blank=True, null=True)
    
    # Redefining last_login as null-friendly (matches your DB schema)
    last_login = models.DateTimeField(null=True, blank=True)
    
    username = None # This is correct
    email = models.EmailField(unique=True) # This is correct
    created_at = models.DateTimeField(default=timezone.now, editable=False) # This is correct

    groups = models.ManyToManyField(
        'auth.Group',
        verbose_name=('groups'),
        blank=True,
        help_text=('The groups this user belongs to.'),
        related_name="system_user_groups", # Changed related_name to avoid conflicts
    )
    user_permissions = models.ManyToManyField(
        'auth.Permission',
        verbose_name=('user permissions'),
        blank=True,
        help_text=('Specific permissions for this user.'),
        related_name="system_user_permissions", # Changed related_name to avoid conflicts
    )

    USERNAME_FIELD = 'email'
    REQUIRED_FIELDS = []

    def __str__(self):
        return self.email

    class Meta:
        # CRUCIAL: Maps the model to the required 'system_users' database table
        db_table = 'system_users'
        verbose_name = 'System User'
        verbose_name_plural = 'System Users'

    pass