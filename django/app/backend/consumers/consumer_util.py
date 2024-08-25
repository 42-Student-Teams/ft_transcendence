import asyncio
import json

from asgiref.sync import async_to_sync, sync_to_async
from channels.generic.websocket import AsyncWebsocketConsumer
from backend.models import JwtUser

from django.conf import settings
import jwt


def register_ws_func(func):
    # mark the method as something that requires view's class
    func.is_registered = True
    return func


class WsConsumerCommon(AsyncWebsocketConsumer):
    funcs = {}

    def __init__(self, *args, **kwargs):
        super().__init__(*args, **kwargs)
        self.authed = False
        self.subscribed_groups = []
        self.user: JwtUser = None
        self.user_username: str = None

        # For every method in a child class marked with the register_ws_func decorator
        # we append it to the funcs dict
        # Idea source: https://stackoverflow.com/a/2367605
        for name in self.__class__.__dict__.keys():
            if hasattr(self.__class__.__dict__[name], "is_registered"):
                self.__class__.funcs[name] = self.__class__.__dict__[name]

    async def connect(self):
        print('someone connected', flush=True)
        await self.accept()

    async def on_disconnect(self):
        pass

    async def disconnect(self, close_code):
        print('someone disconnected', flush=True)
        for group in self.subscribed_groups:
            await self.channel_layer.group_discard(
                group, self.channel_name
            )
        await self.on_disconnect()
        await self.close()

    async def subscribe_to_group(self, group):
        await self.channel_layer.group_add(
            group, self.channel_name
        )
        self.subscribed_groups.append(group)

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
        self.user = JwtUser.objects.filter(username=payload['username']).first()
        if self.user is None:
            print('RETURN', flush=True)
            return
        self.user_username = self.user.username
        print('ALL GOOD', flush=True)
        self.authed = True

    async def receive(self, text_data):
        print('RECEIVE', text_data, flush=True)
        msg_obj = None
        try:
            msg_obj = json.loads(text_data)
        except:
            await self.send(text_data='unauthed')
            return
        if not self.authed:
            print('Not authed, doing auth', flush=True)
            await sync_to_async(self.do_auth)(msg_obj)
            if not self.authed:
                await self.send(text_data='{"status":"unauthed"}')
            else:
                await self.send(text_data='{"status":"authed"}')
                await self.on_auth(msg_obj)
            return

        if msg_obj.get('func') is None:
            return
        if msg_obj.get('func') not in self.funcs.keys():
            return
        await self.funcs[msg_obj.get('func')](self, msg_obj)

    async def on_auth(self, msg_obj):
        pass

    async def send_json(self, content):
        await self.send(text_data=json.dumps(content))

    async def send_channel(self, channel, msgtype, content):
        print(f'SEND TO CHANNEL {channel} ({type(channel)})', flush=True)
        await self.channel_layer.group_send(
            channel, {"type": msgtype, "msg_obj": content}
        )