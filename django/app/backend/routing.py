from django.urls import path

from backend.consumers.wsconsumer import WsConsumer
from backend.consumers.game_consumer import GameConsumer

websocket_urlpatterns = [
    path('wss/comm/', WsConsumer.as_asgi()),
    path('wss/game/', GameConsumer.as_asgi()),
]
