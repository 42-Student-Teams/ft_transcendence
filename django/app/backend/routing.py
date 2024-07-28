from django.urls import path

from backend.consumers.testchat import ChatConsumer
from backend.consumers.wsconsumer import WsConsumer

websocket_urlpatterns = [
    path('wss/chat/', ChatConsumer.as_asgi()),
    path('wss/comm/', WsConsumer.as_asgi()),
]
