import json

from asgiref.sync import async_to_sync
from backend.models import JwtUser, Message
from backend.util import timestamp_now
from backend.consumers.consumer_util import WsConsumerCommon, register_ws_func

class GameConsumer(WsConsumerCommon):
    def __init__(self, *args, **kwargs):
        super().__init__(*args, **kwargs)

    def on_auth(self):
        pass

    def subscribe_to_groups(self):
        if self.user is None:
            return
        print(f'SUBSCRIBE: {self.user.username}', flush=True)
        if len(self.subscribed_groups) > 0:
            return
        self.subscribe_to_group(self.user.username)
        friends = self.user.friends.all()
        for friend in friends:
            self.subscribe_to_group(friend.username)

    @register_ws_func
    def ping(self, msg_obj):
        self.send(text_data=json.dumps({'pong': 'pong'}))

    @register_ws_func
    def client_message(self, msg_obj):
        print(f'CLIENT MESSAGE: {msg_obj}', flush=True)

    def relay_from_controller(self, event):
        self.send(text_data=json.dumps(event["msg_obj"]))