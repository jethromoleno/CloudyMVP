# accounts/roles.py

from django.contrib.auth.models import Group

ROLES = {
    'SuperAdmin': 'Full access, user management.',
    'User': 'Limited access based on assigned modules.',
    # You can add 'Dispatcher' or 'Driver' roles here later if needed
}

def create_initial_groups():
    """
    Creates the initial Django Groups required for the FMS roles.
    """
    print("Creating initial user roles (Groups)...")
    for role_name, description in ROLES.items():
        # get_or_create prevents creating a duplicate if the script runs again
        group, created = Group.objects.get_or_create(name=role_name)
        if created:
            print(f"   ✅ Created '{role_name}' role.")
        else:
            print(f"   ℹ️ Role '{role_name}' already exists.")

    print("Initial roles setup complete.")