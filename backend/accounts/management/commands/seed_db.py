# accounts/management/commands/seed_db.py

from django.core.management.base import BaseCommand
from django.contrib.auth import get_user_model
from django.contrib.auth.models import Group
from accounts.roles import create_initial_groups # Import our function

# Get the custom FMSUser model
User = get_user_model()

class Command(BaseCommand):
    help = 'Seeds the database with initial groups and default users for testing.'

    def handle(self, *args, **options):
        # --- 1. Create Initial Groups (Roles) ---
        create_initial_groups()

        # --- 2. Create Default SuperAdmin User ---
        super_admin_email = 'admin@fms.com'
        if not User.objects.filter(email=super_admin_email).exists():
            self.stdout.write(self.style.NOTICE(f'Creating SuperAdmin user: {super_admin_email}'))
            
            # Create the user without setting is_superuser flag, as we will rely on group membership
            super_admin_user = User.objects.create_user(
                username='superadmin',
                email=super_admin_email,
                password='adminpassword', # Simple password for local testing
                is_staff=True,
            )
            
            # Assign to the 'SuperAdmin' group
            try:
                super_admin_group = Group.objects.get(name='SuperAdmin')
                super_admin_user.groups.add(super_admin_group)
                self.stdout.write(self.style.SUCCESS('   ✅ SuperAdmin user created and group assigned.'))
            except Group.DoesNotExist:
                self.stdout.write(self.style.ERROR("   ❌ Error: 'SuperAdmin' group not found. Did the groups function run?"))

        else:
            self.stdout.write(self.style.NOTICE(f'SuperAdmin user {super_admin_email} already exists.'))
            
        # --- 3. Create Default Regular User ---
        regular_user_email = 'user@fms.com'
        if not User.objects.filter(email=regular_user_email).exists():
            self.stdout.write(self.style.NOTICE(f'Creating Regular User: {regular_user_email}'))
            
            regular_user = User.objects.create_user(
                username='regularuser',
                email=regular_user_email,
                password='userpassword' # Simple password for local testing
            )
            
            # Assign to the 'User' group
            try:
                user_group = Group.objects.get(name='User')
                regular_user.groups.add(user_group)
                self.stdout.write(self.style.SUCCESS('   ✅ Regular User created and group assigned.'))
            except Group.DoesNotExist:
                self.stdout.write(self.style.ERROR("   ❌ Error: 'User' group not found. Did the groups function run?"))

        else:
            self.stdout.write(self.style.NOTICE(f'Regular User {regular_user_email} already exists.'))

        self.stdout.write(self.style.SUCCESS('\nDatabase seeding complete for accounts.'))