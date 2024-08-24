import asyncio
import json

from backend.models import AcknowledgedMatchRequest, JwtUser
from backend.consumers.consumer_util import WsConsumerCommon, register_ws_func
from backend.consumers.game_controller import GameController
from backend.util import random_bot_name

from asgiref.sync import async_to_sync
from channels.db import database_sync_to_async


class GameConsumer(WsConsumerCommon):
    def __init__(self, *args, **kwargs):
        super().__init__(*args, **kwargs)
        self.ball_color: str = 'black'
        self.is_bot: bool = False
        self.opponent: JwtUser = None
        self.fast: bool = False
        self.game_controller: GameController = None
        self.controller_channel = None
        self.author_channel = None
        self.opponent_channel = None
        self.acknowledgement_key = None


    def get_acknowledgement_by_key(self, key):
        try:
            acknowledgement: AcknowledgedMatchRequest = AcknowledgedMatchRequest.objects.filter(match_key=key).first()
            return acknowledgement
        except AcknowledgedMatchRequest.DoesNotExist:
            return None

    def get_request_author_username(self, acknowledgement):
        return acknowledgement.request_author.username
 
    def delete_acknowledgement_by_key(self, key):
        AcknowledgedMatchRequest.objects.filter(match_key=key).delete()

    @staticmethod
    def create_acknowledgement_safe_copy(acknowledgement):
        return AcknowledgedMatchRequest.create_safe_copy(acknowledgement)

    async def on_auth(self, msg_obj):
        print('Received auth message', flush=True)
        if msg_obj.get('match_key') is None:
            await self.close()
            return

        acknowledgement_row: AcknowledgedMatchRequest = await database_sync_to_async(self.get_acknowledgement_by_key)(msg_obj.get('match_key'))
        acknowledgement = await database_sync_to_async(self.create_acknowledgement_safe_copy)(acknowledgement_row)

        if acknowledgement is None:
            await self.close()
            return

        self.ball_color = acknowledgement.ball_color
        self.is_bot = acknowledgement.is_bot
        self.opponent = acknowledgement.target_user
        self.fast = acknowledgement.fast
        self.acknowledgement_key = acknowledgement.match_key

        self.author_channel = f'author_{acknowledgement.match_key}'

        # This is the channel via which the GameController will dispatch updates to both clients
        self.controller_channel = f'controller_{acknowledgement.match_key}'
        await self.subscribe_to_group(self.controller_channel)

        # This is the channel through which the Opponent will send its data to the Author (which will just be
        # forwarded to the controller)
        self.opponent_channel = f'author_{acknowledgement.match_key}'
        await self.subscribe_to_group(self.opponent_channel)

        # this means we are the requesting user, we create the game controller
        request_author_username = await database_sync_to_async(self.get_request_author_username)(acknowledgement)
        if self.user.username == request_author_username:
            print(f'My username is {self.user.username}, the request_author_username is {request_author_username}. Starting GameController', flush=True)
            self.game_controller = GameController(acknowledgement)
            await self.game_controller.start()

        # maybe we should wait for the opponent...
        print('Sending start json', flush=True)
        await self.send_json({
            'type': 'start',
            'ball_color': self.ball_color,
            'is_bot': self.is_bot,
            'author': request_author_username,
            'opponent': self.opponent.username if self.opponent else f'{random_bot_name()} (BOT)',
            'fast': self.fast})

    async def on_disconnect(self):
        if self.game_controller is not None:
            await self.game_controller.stop()
            await database_sync_to_async(self.delete_acknowledgement_by_key)(self.acknowledgement_key)
        else:
            await self.send_channel(self.author_channel, 'opponent_disconnect', {'opponent': self.opponent.username})

    @register_ws_func
    async def ping(self, msg_obj):
        await self.send(text_data=json.dumps({'pong': 'pong'}))

    @register_ws_func
    def join(self, msg_obj):
        pass
        # very important, this has to be used to join a game initiated by another user
        # a game will have its channel as an alphanum ID, which will be sent to the joinee via comm
        # wrong key and you're not allowed in

    @register_ws_func
    async def client_update(self, msg_obj):
        #print(f'Game consumer: got update from user: {msg_obj}, sending to channel {self.controller_channel}', flush=True)
        msg_obj['username'] = self.user.username
        if self.game_controller is not None:
            await self.game_controller.client_update_relay(msg_obj)
        else:
            await self.send_channel(self.opponent_channel, 'opponent_update', msg_obj)

    async def opponent_update(self, msg_obj):
        if self.opponent.username == self.user.username:
            return
        #print(f'Game consumer: got update from opponent: {msg_obj}', flush=True)
        # Yes, it's a nested msg_obj...
        if msg_obj.get('msg_obj') is None:
            return
        await self.game_controller.client_update_relay(msg_obj.get('msg_obj'))

    async def relay_from_controller(self, event):
        await self.send(text_data=json.dumps(event["msg_obj"]))

    async def opponent_disconnect(self, event):
        if self.opponent.username == self.user.username:
            return
        await self.disconnect(0)
