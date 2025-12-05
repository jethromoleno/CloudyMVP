# backend/core/asgi.py

import os
from channels.routing import ProtocolTypeRouter, URLRouter
from django.core.asgi import get_asgi_application
from trips.routing import websocket_urlpatterns # <-- New Import

os.environ.setdefault('DJANGO_SETTINGS_MODULE', 'core.settings')

# Fetch Django's ASGI application
django_asgi_app = get_asgi_application()

application = ProtocolTypeRouter({
    "http": django_asgi_app,

    # WebSocket protocol handling
    "websocket": URLRouter(
        websocket_urlpatterns # Uses the routing we just created
    ),
})