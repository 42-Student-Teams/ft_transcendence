import json

from asgiref.sync import async_to_sync
from channels.generic.websocket import WebsocketConsumer
from backend.models import JwtUser

from django.conf import settings
import jwt

class WsConsumerCommon(WebsocketConsumer):
    def __init__(self, *args, **kwargs):
        super().__init__(*args, **kwargs)
        self.authed = False
        self.subscribed_groups = []
        self.user: JwtUser = None

        self.funcs = {}

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
                self.send(text_data='{"status":"unauthed"}')
            else:
                self.send(text_data='{"status":"authed"}')
                self.subscribe_to_groups()
            return

        if msg_obj.get('func') is None:
            return
        if msg_obj.get('func') not in self.funcs.keys():
            return
        self.funcs[msg_obj.get('func')](msg_obj)

    def subscribe_to_groups(self):
        pass