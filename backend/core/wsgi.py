import os

from django.core.wsgi import get_wsgi_application

os.environ.setdefault('DJANGO_SETTINGS_MODULE', 'core.settings') # Verify settings path is correct

application = get_wsgi_application() # This line defines the missing 'application' object