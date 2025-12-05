# backend/trips/consumers.py
import json
from channels.generic.websocket import AsyncWebsocketConsumer
from asgiref.sync import async_to_sync
from django.utils import timezone


class TripConsumer(AsyncWebsocketConsumer):
    # --- 1. Connection Handling ---

    async def connect(self):
        # Extract the trip ID from the URL route
        self.trip_id = self.scope['url_route']['kwargs']['trip_id']
        # Create a unique group name for this trip
        self.trip_group_name = f'trip_{self.trip_id}'

        # Join the trip-specific group
        await self.channel_layer.group_add(
            self.trip_group_name,
            self.channel_name
        )
        
        # Accept the connection
        await self.accept()

    async def disconnect(self, close_code):
        # Leave the trip-specific group on disconnect
        await self.channel_layer.group_discard(
            self.trip_group_name,
            self.channel_name
        )

    # --- 2. Receiving Data from Client (e.g., Driver app location updates) ---

    async def receive(self, text_data):
        """
        Handle messages received from the WebSocket client (e.g., a driver's device sending location).
        
        The expected format is JSON:
        {"lat": 14.5995, "lng": 120.9842, "status": "in_transit"}
        """
        try:
            text_data_json = json.loads(text_data)
        except json.JSONDecodeError:
            print("Received invalid JSON data.")
            return

        # Prepare the update message payload
        message = {
            'type': 'trip_update', # This corresponds to the handler method below
            'trip_id': self.trip_id,
            'status': text_data_json.get('status'),
            'lat': text_data_json.get('lat'),
            'lng': text_data_json.get('lng'),
            'timestamp': str(timezone.now()),
            # A more complete implementation would retrieve/calculate ETA
            # 'eta_next_stop': text_data_json.get('eta_next_stop') 
        }

        # Send message to the trip group (broadcast to all listening dispatchers/views)
        await self.channel_layer.group_send(
            self.trip_group_name,
            message
        )

    # --- 3. Handling Data from Channel Layer (Broadcast from Django View) ---

    async def trip_update(self, event):
        """
        Custom handler method corresponding to the 'type': 'trip_update' in the message.
        This is called when a message is sent to the group by the Django view (Step 2.5).
        """
        # Send the JSON payload back to the client over the WebSocket
        await self.send(text_data=json.dumps(event))


# You will need to import 'timezone' if you use it in receive(), or remove it for this MVP example
# from django.utils import timezone