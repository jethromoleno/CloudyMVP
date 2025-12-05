# trucks/serializers.py

from rest_framework import serializers
from .models import Truck

class TruckSerializer(serializers.ModelSerializer):
    class Meta:
        model = Truck
        fields = (
            'truck_id', 
            'license_plate', 
            'vin', 
            'tonner_capacity', 
            'status',
            'assigned_driver'
        )
        read_only_fields = ('truck_id',)