from backend.models import JwtUser, Message, MatchRequest, AcknowledgedMatchRequest
from backend.util import timestamp_now
from backend.consumers.consumer_util import WsConsumerCommon, register_ws_func

from asgiref.sync import async_to_sync, sync_to_async
from channels.db import database_sync_to_async


class WsConsumer(WsConsumerCommon):
    def __init__(self, *args, **kwargs):
        super().__init__(*args, **kwargs)

    async def on_auth(self, msg_obj):
        await self.subscribe_to_groups()

    def get_friends(self):
        friends = self.user.friends.all()
        res = []
        for friend in friends:
            res.append(friend.username)
        return res

    async def subscribe_to_groups(self):
        if self.user is None:
            return
        print(f'SUBSCRIBE: {self.user.username}', flush=True)
        if len(self.subscribed_groups) > 0:
            return
        await self.subscribe_to_group(self.user.username)
        friends = await database_sync_to_async(self.get_friends)()
        for friend in friends:
            await self.subscribe_to_group(friend)

    # WEBSOCKET RECEIVERS
    @register_ws_func
    def ping(self, msg_obj):
        self.send_json({'pong': 'pong'})

    @staticmethod
    def get_friend_by_username(friend_username):
        return JwtUser.objects.get(username=friend_username)

    def username_is_blocked(self, username):
        return len(self.user.blocked_users.filter(username=username)) > 0

    def create_message(self, recipient, content):
        Message.objects.create(author=self.user, recipient=recipient, content=content,
                               timestamp=timestamp_now())

    @register_ws_func
    async def direct_message(self, msg_obj):
        print(f"Got message command: to: {msg_obj.get('friend_username')}, message: {msg_obj.get('message')}", flush=True)
        friend_username = msg_obj.get('friend_username')
        if friend_username is None or msg_obj.get('message') is None:
            return
        try:
            friend = await database_sync_to_async(self.get_friend_by_username)(friend_username)
        except JwtUser.DoesNotExist:
            return
        blocked = await database_sync_to_async(self.username_is_blocked)(friend_username)
        if blocked:
            print(f'BLOCKED: {friend_username}, not sending message', flush=True)
            return
        await database_sync_to_async(self.create_message)(friend, msg_obj.get('message'))
        msg_obj['author'] = self.user.username
        print(f"Relaying message {msg_obj.get('message')} to channel", flush=True)
        print('Groups I\'m in:', flush=True)
        print(self.subscribed_groups, flush=True)
        await self.send_channel(friend_username, 'channel_dm', msg_obj)

    def acknowledge_bot_request(self, msg_obj):
        acknowledgement = AcknowledgedMatchRequest.acknowledge_bot_request(
            self.user, None, msg_obj.get('ball_color'),
            msg_obj.get('fast'))
        return acknowledgement

    def request_match(self, msg_obj):
        match = MatchRequest.request_match(request_author=self.user, target_user=friend,
                                   ball_color=msg_obj.get('ball_color'),
                                   fast=msg_obj.get('fast'))
        return match.id

    # 2) server gets game request and replies to it with either a match_request_id
    #    or an acknowledgement (game start), in the case of game against AI
    @register_ws_func
    async def request_game(self, msg_obj):
        errormsg = {'type': 'request_game_resp', 'status': 'error'}
        if msg_obj.get('ball_color') is None or msg_obj.get('ball_color') not in ['black', 'blue', 'red']:
            msg_obj['ball_color'] = 'black'
        if msg_obj.get('fast') is None:
            msg_obj['fast'] = False
        if msg_obj.get('ai') is None:
            await self.send_json(errormsg)
            print("err1", flush=True)
            return
        if msg_obj.get('ai') is None and msg_obj.get('target_user') is None:
            await self.send_json(errormsg)
            print("err2", flush=True)
            return
        if msg_obj.get('target_user') is not None:
            if not JwtUser.objects.filter(username=msg_obj.get('target_user')).exists():
                await self.send_json(errormsg)
                print("err3", flush=True)
                return
            try:
                friend = self.user.friends.get(username=msg_obj.get('target_user'))
            except JwtUser.DoesNotExist:
                await self.send_json(errormsg)
                print("err4", flush=True)
                return
            blocked = self.user.blocked_users.filter(username=friend.username)
            if len(blocked) > 0:
                await self.send_json(errormsg)
                print("err5", flush=True)
                return
            match_request_id = await database_sync_to_async(self.request_match)(msg_obj)
            await self.send_json({'type': 'match_request_id', 'id': match_request_id})
        elif msg_obj.get('ai'):
            acknowledgement = await database_sync_to_async(self.acknowledge_bot_request)(msg_obj)
            await self.send_json({'type': 'game_acknowledgement', 'match_key': acknowledgement.match_key})
            return
        else:
            match_request_id = await database_sync_to_async(self.request_match)(msg_obj)
            await self.send_json({'type': 'match_request_id', 'id': match_request_id})

    # CHANNEL RECEIVERS
    async def channel_dm(self, event):
        print("Got dm on channel", flush=True)
        msg_obj = event["msg_obj"]
        if msg_obj.get('friend_username') == self.user_username:
            # it could contain more fields, which is not desirable
            sanitized_msg_obj = {
                'type': 'dm',
                'author': msg_obj.get('author'),
                'message': msg_obj.get('message'),
            }
            print(f'Sending the json from channel_dm ({self.user_username})', flush=True)
            await self.send_json(sanitized_msg_obj)
