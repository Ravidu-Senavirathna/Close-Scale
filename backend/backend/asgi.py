"""
ASGI config for Close-Scale (Altrium CRM).

Routes HTTP requests through Django and WebSocket connections through
Django Channels. WebSocket URL patterns will be added here as Epic 8
(Communication) features are built.
"""

import os

from channels.auth import AuthMiddlewareStack
from channels.routing import ProtocolTypeRouter, URLRouter
from channels.security.websocket import AllowedHostsOriginValidator
# pyrefly: ignore [missing-import]
from django.core.asgi import get_asgi_application

os.environ.setdefault("DJANGO_SETTINGS_MODULE", "backend.settings")

# Initialize Django ASGI application early to ensure AppRegistry is populated
# before importing routing modules that import models.
django_asgi_app = get_asgi_application()

# Import WebSocket URL patterns after Django is initialized.
# This list will grow as real-time features (notifications, chat) are added.
from api.routing import websocket_urlpatterns  # noqa: E402

application = ProtocolTypeRouter(
    {
        # HTTP → Django views (REST API, admin)
        "http": django_asgi_app,
        # WebSocket → Django Channels consumers
        "websocket": AllowedHostsOriginValidator(
            AuthMiddlewareStack(URLRouter(websocket_urlpatterns))
        ),
    }
)
