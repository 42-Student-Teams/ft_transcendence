import json

from django.conf import settings
import jwt
from channels.generic.websocket import WebsocketConsumer

from backend.models import JwtUser


class WsConsumer(WebsocketConsumer):
    def __init__(self, *args, **kwargs):
        super().__init__(*args, **kwargs)
        self.authed = False
        self.user: JwtUser = None

        self.funcs = {
            'ping': self.ping,
        }

    def connect(self):
        print('someone connected', flush=True)
        self.accept()

    def disconnect(self, close_code):
        print('someone disconnected', flush=True)

    def do_auth(self, msg_obj):
        if msg_obj.get('jwt') is None:
            return
        try:
            payload = jwt.decode(msg_obj.get('jwt'), settings.JWT_SECRET, algorithms=['HS256'])
        except jwt.ExpiredSignatureError:
            return
        except (IndexError, jwt.DecodeError):
            return
        if 'username' not in payload:
            return
        self.user = JwtUser.objects.get(username=payload['username'])
        if self.user is None:
            return
        self.authed = True

    def receive(self, text_data):
        print(text_data, flush=True)
        print(dir(text_data), flush=True)
        msg_obj = None
        try:
            msg_obj = json.loads(text_data)
        except:
            return
        if not self.authed:
            self.do_auth(msg_obj)
            return

        if msg_obj.get('func') is None:
            return
        if msg_obj.get('func') not in self.funcs.keys():
            return
        self.funcs[msg_obj.get('func')](self, msg_obj)

    def ping(self, msg_obj):
        self.send(text_data=json.dumps({'pong': 'pong'}))

