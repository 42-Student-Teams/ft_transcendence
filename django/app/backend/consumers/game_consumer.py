import json

from backend.models import AcknowledgedMatchRequest, JwtUser
from backend.consumers.consumer_util import WsConsumerCommon, register_ws_func
from backend.util import random_bot_name


class GameConsumer(WsConsumerCommon):
    def __init__(self, *args, **kwargs):
        super().__init__(*args, **kwargs)
        self.ball_color: str = 'black'
        self.is_bot: bool = False
        self.opponent: JwtUser = None
        self.fast: bool = False

    def on_auth(self, msg_obj):
        if msg_obj.get('acknowledge_id') is None:
            self.close()
            return
        try:
            acknowledgement: AcknowledgedMatchRequest = AcknowledgedMatchRequest.objects.get(id=msg_obj.get('acknowledge_id'))
        except AcknowledgedMatchRequest.DoesNotExist:
            self.close()
            return
        AcknowledgedMatchRequest.objects.filter(id=msg_obj.get('acknowledge_id')).delete()
        self.ball_color = acknowledgement.ball_color
        self.is_bot = acknowledgement.is_bot
        self.opponent = acknowledgement.target_user
        self.fast = acknowledgement.fast
        self.send_json({
            'type': 'start',
            'ball_color': self.ball_color,
            'is_bot': self.is_bot,
            'opponent': self.opponent.username if self.opponent else f'{random_bot_name()} (BOT)',
            'fast': self.fast})

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
    def start(self, msg_obj):
        print(f'START MESSAGE: {msg_obj}', flush=True)
        if not 'game_id' in msg_obj:
            return
        try:
            acknowledgement = AcknowledgedMatchRequest.objects.get(game_id=msg_obj['game_id'])
        except AcknowledgedMatchRequest.DoesNotExist:
            return
        AcknowledgedMatchRequest.objects.filter(request_author=self.user).delete()
        print(f'STARTING GAME FOR USER {acknowledgement.request_author.username}', flush=True)
        # acknowledgement contains all the verified info needed to start a game

    @register_ws_func
    def join(self, msg_obj):
        pass
        # very important, this has to be used to join a game initiated by another user
        # a game will have its channel as an alphanum ID, which will be sent to the joinee via comm
        # wrong key and you're not allowed in

    def relay_from_controller(self, event):
        self.send(text_data=json.dumps(event["msg_obj"]))