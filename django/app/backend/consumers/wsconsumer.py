from backend.models import JwtUser, Message, MatchRequest
from backend.util import timestamp_now
from backend.consumers.consumer_util import WsConsumerCommon, register_ws_func

class WsConsumer(WsConsumerCommon):
    def __init__(self, *args, **kwargs):
        super().__init__(*args, **kwargs)

    def connect(self):
        super().connect()
        if self.authed:
            self.update_user_status('Connected')

    def disconnect(self, close_code):
        if self.authed:
            self.update_user_status('Offline')
        super().disconnect(close_code)

    def on_auth(self):
        self.subscribe_to_groups()
        self.update_user_status('Connected')

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

    def update_user_status(self, status):
        if self.user:
            self.user.status = status
            self.user.save()
            self.broadcast_status_change()

    def broadcast_status_change(self):
        for friend in self.user.friends.all():
            self.send_channel(friend.username, 'friend_status_change', {
                'user': self.user.username,
                'status': self.user.status
            })

    # WEBSOCKET RECEIVERS
    @register_ws_func
    def ping(self, msg_obj):
        self.send_json({'pong': 'pong'})

    @register_ws_func
    def direct_message(self, msg_obj):
        print(f"Got message command: to: {msg_obj.get('friend_username')}, message: {msg_obj.get('message')}", flush=True)
        friend_username = msg_obj.get('friend_username')
        if friend_username is None or msg_obj.get('message') is None:
            return
        try:
            friend = JwtUser.objects.get(username=friend_username)
        except JwtUser.DoesNotExist:
            return
        blocked = self.user.blocked_users.filter(username=friend_username)
        if len(blocked) > 0:
            print(f'BLOCKED: {friend_username}, not sending message', flush=True)
            return
        Message.objects.create(author=self.user, recipient=friend, content=msg_obj.get('message'), timestamp=timestamp_now())
        msg_obj['author'] = self.user.username
        print(f"Relaying message {msg_obj.get('message')} to channel", flush=True)
        print('Groups I\'m in:', flush=True)
        print(self.subscribed_groups, flush=True)
        self.send_channel(friend.username, 'channel_dm', msg_obj)

    @register_ws_func
    def request_game(self, msg_obj):
        errormsg = {'type': 'request_game_resp', 'status': 'error'}
        if msg_obj.get('ball_color') is None or msg_obj.get('ball_color') not in ['black', 'blue', 'red']:
            msg_obj['ball_color'] = 'black'
        if msg_obj.get('fast') is None:
            msg_obj['fast'] = False
        if msg_obj.get('ai') is None:
            self.send_json(errormsg)
            return
        if msg_obj.get('ai') is None and msg_obj.get('target_user') is None:
            self.send_json(errormsg)
            return
        if msg_obj.get('target_user') is not None:
            if not JwtUser.objects.filter(username=msg_obj.get('target_user')).exists():
                self.send_json(errormsg)
                return
            try:
                friend = self.user.friends.get(username=msg_obj.get('target_user'))
            except JwtUser.DoesNotExist:
                self.send_json(errormsg)
                return
            blocked = self.user.blocked_users.filter(username=friend.username)
            if len(blocked) > 0:
                self.send_json(errormsg)
                return
            MatchRequest.request_match(request_author=self.user, target_user=friend)
        elif msg_obj.get('ai'):
            self.send_json({'type': 'request_game_resp', 'status': 'success', 'game_type': 'ai',
                            'ball_color': msg_obj.get('ball_color'), 'fast': msg_obj.get('fast')})
            return
        else:
            self.send_json(errormsg)

    # CHANNEL RECEIVERS
    def channel_dm(self, event):
        print("Got dm on channel", flush=True)
        msg_obj = event["msg_obj"]
        if msg_obj.get('friend_username') == self.user.username:
            sanitized_msg_obj = {
                'type': 'dm',
                'author': msg_obj.get('author'),
                'message': msg_obj.get('message'),
            }
            self.send_json(sanitized_msg_obj)

    def friend_status_change(self, event):
        msg_obj = event["msg_obj"]
        self.send_json({
            'type': 'friend_status_update',
            'username': msg_obj['user'],
            'status': msg_obj['status']
        })