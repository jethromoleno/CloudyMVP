# accounts/permissions.py

from rest_framework.permissions import BasePermission
from django.contrib.auth.models import Group

class IsSuperAdmin(BasePermission):
    """
    Custom permission to only allow access to users in the 'SuperAdmin' group.
    """
    
    def has_permission(self, request, view):
        # Check if the user is authenticated
        if not request.user.is_authenticated:
            return False
            
        # The user must belong to the 'SuperAdmin' group.
        # Check if the group exists to prevent errors, though it should exist 
        # after running the initial seeder script.
        try:
            super_admin_group = Group.objects.get(name='SuperAdmin')
        except Group.DoesNotExist:
            # If the group doesn't exist, nobody can be a SuperAdmin.
            return False 

        # Return True if the user is a member of the SuperAdmin group
        return super_admin_group in request.user.groups.all()
    
class HasAppModuleAccess(BasePermission):
    """
    Custom permission to ensure a regular User has 'view' access 
    to the app module associated with the view.
    
    - SuperAdmins are always granted full access.
    - Regular Users must have the 'view' permission for the ViewSet's model.
    """
    
    def has_permission(self, request, view):
        user = request.user
        
        # 1. Must be authenticated
        if not user.is_authenticated:
            return False
            
        # 2. Check for SuperAdmin Status (Full Access)
        try:
            # Reusing the SuperAdmin check logic
            super_admin_group = Group.objects.get(name='SuperAdmin')
            if super_admin_group in user.groups.all():
                return True  # SuperAdmin has full access 
        except Group.DoesNotExist:
            pass 

        # 3. Regular User Permission Check (Limited Access) 
        
        # This requires the ViewSet to be model-backed (DRF standard)
        if not hasattr(view, 'queryset') and not hasattr(view, 'model'):
            return False

        # Get the model class from the ViewSet
        ModelClass = getattr(view, 'model', None) or getattr(view.queryset, 'model', None)

        if not ModelClass:
            return False

        # Construct the required permission string: '{app_label}.view_{model_name}'
        # This permission will grant module access
        app_label = ModelClass._meta.app_label
        model_name = ModelClass._meta.model_name
        
        required_permission = f'{app_label}.view_{model_name}'
        
        # Check if the regular user has the assigned permission
        return user.has_perm(required_permission)

class IsAssignedDriverOrDispatcher(BasePermission):
    """
    Custom permission to ensure:
    1. SuperAdmins/Dispatchers have full access to trip objects.
    2. Drivers can only retrieve (GET) the trip objects they are assigned to.
    """
    
    def is_dispatcher_or_admin(self, user):
        """Helper to check if the user is a Dispatcher or SuperAdmin."""
        if not user.is_authenticated:
            return False
            
        # Check for SuperAdmin (full access)
        try:
            super_admin_group = Group.objects.get(name='SuperAdmin')
            if super_admin_group in user.groups.all():
                return True
        except Group.DoesNotExist:
            pass 
        
        # NOTE: If you create a 'Dispatcher' Group later, check for it here.
        # For now, we assume only SuperAdmin has dispatching privileges.
        return False
        
    def has_permission(self, request, view):
        # Allow SuperAdmins/Dispatchers to see the list and create objects
        if self.is_dispatcher_or_admin(request.user):
            return True
            
        # Drivers should only be able to retrieve (safe methods like GET) objects, 
        # and we check assignment in has_object_permission.
        if request.method in ('GET', 'HEAD', 'OPTIONS'):
            return True
            
        # Deny all other methods (POST, PUT, DELETE) for non-admin/dispatcher users
        return False

    def has_object_permission(self, request, view, obj):
        user = request.user
        
        # 1. Allow SuperAdmins/Dispatchers full control over the specific object
        if self.is_dispatcher_or_admin(user):
            return True
            
        # 2. Driver Check (Only for safe methods like GET)
        if request.method in ('GET', 'HEAD', 'OPTIONS'):
            # This logic assumes the Trip model (obj) has an 'assigned_driver' 
            # attribute that links to the User/Employee instance.
            return hasattr(obj, 'assigned_driver') and obj.assigned_driver == user

        # Deny all other requests (PUT, DELETE) for non-assigned users
        return False
