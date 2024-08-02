from django.urls import path

from backend.consumers.wsconsumer import WsConsumer

websocket_urlpatterns = [
    path('wss/comm/', WsConsumer.as_asgi()),
]
