# backend/trips/views.py

from rest_framework import viewsets, status
from rest_framework.decorators import action
from rest_framework.response import Response
from django.utils import timezone # Make sure this is imported

# --- ADD THESE IMPORTS FOR CHANNELS ---
from channels.layers import get_channel_layer
from asgiref.sync import async_to_sync
# -------------------------------------

from .models import Trip
from .serializers import TripSerializer, TripDetailSerializer
# from accounts.permissions import ... (your existing imports)
from accounts.permissions import IsAssignedDriverOrDispatcher, IsSuperAdmin


class TripViewSet(viewsets.ModelViewSet):
    queryset = Trip.objects.all().order_by('-scheduled_start_time')
    serializer_class = TripSerializer
    
    # --- Custom Action for Status Update ---
    @action(detail=True, methods=['patch'], url_path='status', 
            # Use your existing permission classes here
            permission_classes=[IsAssignedDriverOrDispatcher | IsSuperAdmin]) 

    def set_status(self, request, pk=None):
        """Endpoint to allow drivers or dispatchers to update trip status."""
        trip = self.get_object()
        new_status = request.data.get('status')
        
        if not new_status:
            return Response({'detail': 'Status field is required.'}, status=status.HTTP_400_BAD_REQUEST)

        valid_statuses = ['In Transit', 'Completed', 'Canceled', 'Delayed', 'Scheduled']
        if new_status not in valid_statuses:
             return Response({'detail': f'Invalid status. Must be one of: {", ".join(valid_statuses)}'}, status=status.HTTP_400_BAD_REQUEST)

        # 1. Update database record
        trip.status = new_status
        if new_status == 'In Transit' and not trip.actual_start_time:
            # Record the actual start time only on the first transit update
            trip.actual_start_time = timezone.now()
            
        trip.save(update_fields=['status', 'actual_start_time'])

        # 2. --- REAL-TIME PUSH LOGIC (CRITICAL ADDITION) ---
        channel_layer = get_channel_layer()
        # The group name must match the one used in the consumer
        trip_group_name = f'trip_{trip.trip_id}'

        # Create the message payload (lat/lng are placeholders or use the last known location)
        message = {
            'type': 'trip_update', # This must match the consumer method name
            'trip_id': trip.trip_id,
            'timestamp': timezone.now().isoformat(),
            'status': trip.status,
            'lat': 14.5995, # Placeholder (replace with actual location data if available)
            'lng': 120.9842, # Placeholder
            # You can add 'eta_next_stop' here if you calculate it
        }

        # Send the message to the group asynchronously
        async_to_sync(channel_layer.group_send)(
            trip_group_name,
            message
        )
        # --- END REAL-TIME PUSH LOGIC ---
        
        return Response(TripDetailSerializer(trip).data, status=status.HTTP_200_OK)