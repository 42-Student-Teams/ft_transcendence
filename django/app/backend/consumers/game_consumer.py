import json

from backend.models import AcknowledgedMatchRequest, JwtUser
from backend.consumers.consumer_util import WsConsumerCommon, register_ws_func
from backend.consumers.game_controller import GameController
from backend.util import random_bot_name

from asgiref.sync import async_to_sync

class GameConsumer(WsConsumerCommon):
    def __init__(self, *args, **kwargs):
        super().__init__(*args, **kwargs)
        self.ball_color: str = 'black'
        self.is_bot: bool = False
        self.opponent: JwtUser = None
        self.fast: bool = False
        self.game_controller: GameController = None
        self.controller_channel = None

    def on_auth(self, msg_obj):
        if msg_obj.get('match_key') is None:
            self.close()
            return
        try:
            acknowledgement: AcknowledgedMatchRequest = AcknowledgedMatchRequest.objects.get(match_key=msg_obj.get('match_key'))
        except AcknowledgedMatchRequest.DoesNotExist:
            self.close()
            return
        AcknowledgedMatchRequest.objects.filter(match_key=msg_obj.get('match_key')).delete()
        self.ball_color = acknowledgement.ball_color
        self.is_bot = acknowledgement.is_bot
        self.opponent = acknowledgement.target_user
        self.fast = acknowledgement.fast

        # this means we are the requesting user, we create the game controller
        if self.user.username == acknowledgement.request_author.username:
            self.game_controller = GameController(acknowledgement)

            async_to_sync(self.game_controller.__call__)(None, None, None)

            #self.game_controller(None, None, None)
            #print(f'BRUHHHHH: {self.game_controller(None, None, None).channel_name}', flush=True)
            #print(dir(self.game_controller.consumer_class), flush=True)
            self.controller_channel = f'{acknowledgement.request_author.username}_{acknowledgement.match_key}'
            self.subscribe_to_group(self.controller_channel)

        self.send_json({
            'type': 'start',
            'ball_color': self.ball_color,
            'is_bot': self.is_bot,
            'opponent': self.opponent.username if self.opponent else f'{random_bot_name()} (BOT)',
            'fast': self.fast})

    @register_ws_func
    def ping(self, msg_obj):
        self.send(text_data=json.dumps({'pong': 'pong'}))

    @register_ws_func
    def join(self, msg_obj):
        pass
        # very important, this has to be used to join a game initiated by another user
        # a game will have its channel as an alphanum ID, which will be sent to the joinee via comm
        # wrong key and you're not allowed in

    @register_ws_func
    def client_update(self, msg_obj):
        print(f'GC: got update from user: {msg_obj}, sending to channel {self.controller_channel}', flush=True)
        self.send_channel(self.controller_channel, 'client_update_relay', msg_obj)


    def relay_from_controller(self, event):
        print(f'Relaying from controller: {event}', flush=True)
        self.send(text_data=json.dumps(event["msg_obj"]))