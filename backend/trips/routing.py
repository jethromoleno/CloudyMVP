# backend/trips/routing.py

from django.urls import re_path
from . import consumers

# Defines the list of URL patterns that map to WebSocket consumers
websocket_urlpatterns = [
    # Maps ws://<host>/ws/trips/{trip_id}/ to TripConsumer
    re_path(r'ws/trips/(?P<trip_id>\w+)/$', consumers.TripConsumer.as_asgi()),
]