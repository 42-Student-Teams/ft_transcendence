'''from channels.routing import ProtocolTypeRouter, URLRouter
from django.urls import path

from backend.consumers.testchat import ChatConsumer

application = ProtocolTypeRouter({
    'websocket': URLRouter([
        path('ws/chat/', ChatConsumer.as_asgi()),
    ])
})'''

'''websocket_urlpatterns = [
    # other websocket URLs here
    path(r"ws/chat/", ChatConsumer.as_asgi(), name="chat"),
]'''

from django.urls import path
from django.urls import re_path

from backend.consumers.testchat import ChatConsumer

websocket_urlpatterns = [
    path('wss/chat/', ChatConsumer.as_asgi()),
]
