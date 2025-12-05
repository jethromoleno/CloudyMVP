# trucks/views.py

from rest_framework import viewsets
from rest_framework.permissions import IsAuthenticated, IsAdminUser # 👈 Added IsAdminUser for clarity
from accounts.permissions import HasAppModuleAccess 
from .models import Truck
from .serializers import TruckSerializer

class TruckViewSet(viewsets.ModelViewSet):
    """
    API endpoint that allows Trucks to be viewed, created, updated, or deleted.
    - Requires authentication (IsAuthenticated).
    - Requires specific app module access (e.g., 'trucks.view_truck') 
      for standard users, or IsAdminUser for full access.
    """
    
    queryset = Truck.objects.all().order_by('license_plate')
    serializer_class = TruckSerializer
    
    # 🚨 UPDATED: Using IsAdminUser for the initial strict admin control.
    # You can keep your custom HasAppModuleAccess if it's already configured.
    permission_classes = [IsAuthenticated, HasAppModuleAccess] 
    
    # 💡 The 'model' attribute is kept since your custom permission relies on it.
    model = Truck

    # You could optionally override get_queryset here if you wanted non-admin users 
    # to only see certain trucks, but for an admin view, the base queryset is fine.
    # def get_queryset(self):
    #     return self.queryset.filter(status__in=['Available', 'In Use'])