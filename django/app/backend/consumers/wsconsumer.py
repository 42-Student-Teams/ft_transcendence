import json

from asgiref.sync import async_to_sync
from django.conf import settings
import jwt
from channels.generic.websocket import WebsocketConsumer

from backend.models import JwtUser

from backend.models import Message

from backend.util import timestamp_now


class WsConsumer(WebsocketConsumer):
    def __init__(self, *args, **kwargs):
        super().__init__(*args, **kwargs)

        # todo: instead of comm, groups for all friends and the user should be joined
        self.room_group_name = "comm"
        self.authed = False
        self.subscribed_groups = []
        self.user: JwtUser = None

        self.funcs = {
            'ping': self.ping,
            'direct_message': self.direct_message,
        }


    def connect(self):
        print('someone connected', flush=True)
        print(self.channel_layer, flush=True)
        self.accept()

    def disconnect(self, close_code):
        print('someone disconnected', flush=True)
        for group in self.subscribed_groups:
            async_to_sync(self.channel_layer.group_discard)(
                group, self.channel_name
            )

    def do_auth(self, msg_obj):
        print('Doing auth', flush=True)
        if msg_obj.get('jwt') is None:
            print('RETURN', flush=True)
            return
        try:
            payload = jwt.decode(msg_obj.get('jwt'), settings.JWT_SECRET, algorithms=['HS256'])
        except jwt.ExpiredSignatureError:
            print('RETURN', flush=True)
            return
        except (IndexError, jwt.DecodeError):
            print('RETURN', flush=True)
            return
        if 'username' not in payload:
            print('RETURN', flush=True)
            return
        self.user = JwtUser.objects.get(username=payload['username'])
        if self.user is None:
            print('RETURN', flush=True)
            return
        print('ALL GOOD', flush=True)
        self.authed = True

    def subscribe_to_groups(self):
        if self.user is None:
            return
        print(f'SUBSCRIBE: {self.user.username}', flush=True)
        if len(self.subscribed_groups) > 0:
            return
        async_to_sync(self.channel_layer.group_add)(
            self.user.username, self.channel_name
        )
        self.subscribed_groups.append(self.user.username)
        friends = self.user.friends.all()
        for friend in friends:
            async_to_sync(self.channel_layer.group_add)(
                friend.username, self.channel_name
            )
            self.subscribed_groups.append(friend.username)

    def receive(self, text_data):
        print('RECEIVE', text_data, flush=True)
        msg_obj = None
        try:
            msg_obj = json.loads(text_data)
        except:
            self.send(text_data='unauthed')
            return
        if not self.authed:
            self.do_auth(msg_obj)
            if not self.authed:
                self.send(text_data='{"status":"unauthed"}');
            else:
                self.send(text_data='{"status":"authed"}');
                self.subscribe_to_groups()
            return

        if msg_obj.get('func') is None:
            return
        if msg_obj.get('func') not in self.funcs.keys():
            return
        self.funcs[msg_obj.get('func')](msg_obj)

    def ping(self, msg_obj):
        self.send(text_data=json.dumps({'pong': 'pong'}))

    def direct_message(self, msg_obj):
        print(f"Got message command: to: {msg_obj.get('friend_username')}, message: {msg_obj.get('message')}", flush=True)
        friend_username = msg_obj.get('friend_username')
        if friend_username is None or msg_obj.get('message') is None:
            return
        friend = JwtUser.objects.get(username=friend_username)
        if friend is None:
            return
        Message.objects.create(author=self.user, recipient=friend, content=msg_obj.get('message'), timestamp=timestamp_now())
        msg_obj['author'] = self.user.username
        print(f"Relaying message {msg_obj.get('message')} to channel", flush=True)
        print('Groups I\'m in:', flush=True)
        print(self.subscribed_groups, flush=True)
        async_to_sync(self.channel_layer.group_send)(
            friend.username, {"type": "channel_dm", "msg_obj": msg_obj}
        )

    def channel_dm(self, event):
        print("Got dm on channel", flush=True)
        msg_obj = event["msg_obj"]
        if msg_obj.get('friend_username') == self.user.username:
            # it could contain more fields, which is not desirable
            sanitized_msg_obj = {
                'type': 'dm',
                'author': msg_obj.get('author'),
                'message': msg_obj.get('message'),
            }
            self.send(text_data=json.dumps(sanitized_msg_obj));
