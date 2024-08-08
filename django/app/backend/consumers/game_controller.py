import json

from asgiref.sync import async_to_sync
from channels.generic.websocket import WebsocketConsumer
from backend.models import JwtUser

from django.conf import settings


def register_ws_func(func):
    # mark the method as something that requires view's class
    func.is_registered = True
    return func


class GameController(WebsocketConsumer):
    def __init__(self, *args, **kwargs):
        super().__init__(*args, **kwargs)
        self.subscribed_groups = []

    def subscribe_to_group(self, group):
        async_to_sync(self.channel_layer.group_add)(
            group, self.channel_name
        )
        self.subscribed_groups.append(group)

    def send_json(self, content):
        self.send(text_data=json.dumps(content))

    def send_channel(self, channel, msgtype, content):
        async_to_sync(self.channel_layer.group_send)(
            channel, {"type": msgtype, "msg_obj": content}
        )

    def game_control_msg(self, event):
        print("Game msg received:", flush=True)
        msg_obj = event["msg_obj"]
        print(msg_obj, flush=True)
