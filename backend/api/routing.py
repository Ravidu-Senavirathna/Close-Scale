"""
WebSocket URL routing for Django Channels.

Add consumer URL patterns here as real-time features are built:
  - Epic 5 (F5.3): Notification consumer
  - Epic 8 (F8.1): Chat consumer

Example:
    from api.consumers.notifications import NotificationConsumer
    websocket_urlpatterns = [
        re_path(r"ws/notifications/$", NotificationConsumer.as_asgi()),
    ]
"""

websocket_urlpatterns: list = []
