import json

from asgiref.sync import sync_to_async
from channels.generic.websocket import AsyncWebsocketConsumer
from backend.models import JwtUser

from app.settings import logger
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
        self.connected = False

        # For every method in a child class marked with the register_ws_func decorator
        # we append it to the funcs dict
        # Idea source: https://stackoverflow.com/a/2367605
        for name in self.__class__.__dict__.keys():
            if hasattr(self.__class__.__dict__[name], "is_registered"):
                self.__class__.funcs[name] = self.__class__.__dict__[name]

    async def connect(self):
        logger.debug('someone connected')
        await self.accept()
        self.connected = True

    async def on_disconnect(self):
        pass

    async def disconnect(self, close_code):
        logger.debug('someone disconnected')
        for group in self.subscribed_groups:
            await self.channel_layer.group_discard(
                group, self.channel_name
            )
        await self.on_disconnect()
        self.connected = False
        await self.close()

    async def subscribe_to_group(self, group):
        await self.channel_layer.group_add(
            group, self.channel_name
        )
        self.subscribed_groups.append(group)

    def do_auth(self, msg_obj):
        logger.debug('Doing auth')
        if msg_obj.get('jwt') is None:
            logger.debug('RETURN 1')
            return
        try:
            payload = jwt.decode(msg_obj.get('jwt'), settings.JWT_SECRET, algorithms=['HS256'])
        except jwt.ExpiredSignatureError:
            logger.debug('RETURN 2')
            return
        except (IndexError, jwt.DecodeError):
            logger.debug('RETURN 3')
            return
        if 'username' not in payload:
            logger.debug('RETURN 4')
            return
        self.user = JwtUser.objects.filter(username=payload['username']).first()
        if self.user is None:
            logger.debug('RETURN 5')
            return
        self.user_username = self.user.username
        logger.debug('ALL GOOD')
        self.authed = True

    async def receive(self, text_data):
        #logger.debug(dir(self))
        if not self.connected:
            return
        logger.debug(f'RECEIVE {text_data}')
        msg_obj = None
        try:
            msg_obj = json.loads(text_data)
        except:
            try:
                await self.send(text_data='unauthed')
            except:
                pass
            return
        if not self.authed:
            logger.debug('Not authed, doing auth')
            await sync_to_async(self.do_auth)(msg_obj)
            if not self.authed:
                try:
                    await self.send(text_data='{"status":"unauthed"}')
                except:
                    pass
            else:
                try:
                    await self.send(text_data='{"status":"authed"}')
                except:
                    pass
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
        try:
            await self.send(text_data=json.dumps(content))
        except:
            pass # socket was closed

    async def send_channel(self, channel, msgtype, content):
        logger.debug(f'SEND TO CHANNEL {channel} ({type(channel)})')
        await self.channel_layer.group_send(
            channel, {"type": msgtype, "msg_obj": content}
        )