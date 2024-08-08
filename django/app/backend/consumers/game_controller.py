import functools
import json

from asgiref.sync import async_to_sync
from channels.generic.websocket import WebsocketConsumer
from channels.layers import get_channel_layer

from backend.models import JwtUser, AcknowledgedMatchRequest

from django.conf import settings


def register_ws_func(func):
    # mark the method as something that requires view's class
    func.is_registered = True
    return func


class GameController():
    def __init__(self, acknowledgement: AcknowledgedMatchRequest):
        self.acknowledgement = acknowledgement
        self.chan

    def send_game_update(self, update):
        for group in self.subscribed_groups:
            print(f'Relaying to group {group}', flush=True)
            self.send_channel(group, 'relay_from_controller', update)

    def send_channel(self, channel, msgtype, content):
        async_to_sync(self.channel_layer.group_send)(
            channel, {"type": msgtype, "msg_obj": content}
        )

    def client_update_relay(self, event):
        print("client update received in controller:", flush=True)
        msg_obj = event["msg_obj"]
        print(msg_obj, flush=True)
