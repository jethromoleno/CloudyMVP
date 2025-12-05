# employees/views.py

from rest_framework import viewsets, permissions
from accounts.models import FMSUser 
from .serializers import DriverSerializer
from rest_framework.permissions import IsAuthenticated, IsAdminUser

class DriverViewSet(viewsets.ModelViewSet):
    serializer_class = DriverSerializer
    permission_classes = [IsAuthenticated, IsAdminUser]

    def get_queryset(self):
        return FMSUser.objects.filter(role='driver').order_by('id')
    
    def perform_create(self, serializer):
        # 1. Save the user object, but don't commit to the database yet
        user = serializer.save() 
        
        # 2. Set the role (ensuring a new driver is created with 'driver' role)
        user.role = 'driver'
        
        # 3. Hash and set the password using set_password, which is crucial
        if user.password:
            user.set_password(user.password)
            
        # 4. Save the object again with the hashed password and correct role
        user.save()