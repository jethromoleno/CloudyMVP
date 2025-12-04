from django.db import models
from django.contrib.auth.models import (
    AbstractBaseUser, BaseUserManager, PermissionsMixin
)
from django.contrib.postgres.fields import ArrayField
from django.utils import timezone

# 1. Define ENUM Choices to match PostgreSQL types (user_role and app_module) 
class UserRole(models.TextChoices):
    SUPER_ADMIN = 'SuperAdmin', 'SuperAdmin'
    ADMIN = 'Admin', 'Admin'
    USER = 'User', 'User'

class AppModule(models.TextChoices):
    INVENTORY = 'inventory', 'inventory'
    TRIP_SCHEDULING = 'trip_scheduling', 'trip_scheduling'
    BILLING = 'billing', 'billing'

# 2. Custom User Manager (Required for AbstractBaseUser)
class UserManager(BaseUserManager):
    def create_user(self, username, password=None, **extra_fields):
        if not username:
            raise ValueError('The Username field must be set')
        user = self.model(username=username, **extra_fields)
        user.set_password(password)
        user.save(using=self._db)
        return user

    def create_superuser(self, username, password=None, **extra_fields):
        # Set required flags for Admin integration
        extra_fields.setdefault('is_active', True)
        extra_fields.setdefault('is_staff', True)
        extra_fields.setdefault('is_superuser', True)
        extra_fields.setdefault('role', UserRole.SUPER_ADMIN)
        
        # Default permissions for SuperAdmin based on SQL seed data [cite: 22]
        default_permissions = [
            AppModule.INVENTORY, 
            AppModule.TRIP_SCHEDULING, 
            AppModule.BILLING
        ]
        extra_fields.setdefault('permissions', default_permissions)
        
        return self.create_user(username, password, **extra_fields)

# 3. Custom User Model
class User(AbstractBaseUser, PermissionsMixin):
    # username VARCHAR(50) NOT NULL UNIQUE
    username = models.CharField(max_length=50, unique=True)
    
    # role user_role NOT NULL DEFAULT 'User' [cite: 7, 11]
    role = models.CharField(
        max_length=50,
        choices=UserRole.choices,
        default=UserRole.USER,
        null=False
    )
    
    # permissions app_module[] DEFAULT '{}' [cite: 8, 11]
    # NOTE: Uses Django's ArrayField to map to the PostgreSQL array type. 
    # Requires 'django.contrib.postgres' in INSTALLED_APPS.
    permissions = ArrayField(
        models.CharField(max_length=50, choices=AppModule.choices),
        default=list,
        blank=True
    )
    
    # created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP 
    created_at = models.DateTimeField(default=timezone.now, editable=False)
    
    # Required Django/Admin Fields 
    is_active = models.BooleanField(default=True)
    is_staff = models.BooleanField(default=False)
    
    objects = UserManager()

    USERNAME_FIELD = 'username'
    REQUIRED_FIELDS = ['role'] 

    class Meta:
        # CRUCIAL FIX: Sets the table name to match the SQL script 
        db_table = 'system_users'
        verbose_name = 'System User'
        verbose_name_plural = 'System Users'