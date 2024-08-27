from backend.models import JwtUser, Message, MatchRequest, AcknowledgedMatchRequest, GameSearchQueue
from backend.util import timestamp_now, random_alphanum, AnonClass
from backend.consumers.consumer_util import WsConsumerCommon, register_ws_func

from asgiref.sync import async_to_sync, sync_to_async
from channels.db import database_sync_to_async


class WsConsumer(WsConsumerCommon):
    def __init__(self, *args, **kwargs):
        super().__init__(*args, **kwargs)

    def clean_db_entries(self):
        MatchRequest.objects.filter(request_author=self.user).delete()
        AcknowledgedMatchRequest.objects.filter(request_author=self.user).delete()
        GameSearchQueue.objects.filter(user=self.user).delete()

    async def on_auth(self, msg_obj):
        await self.subscribe_to_groups()
        await self.update_user_status('Connected')

    def update_user_status_safe(self, status):
        if self.user:
            print(f"Updating status for user {self.user.username} to {status}")
            self.user.status = status
            self.user.save()

    async def update_user_status(self, status):
        if self.user:
            await database_sync_to_async(self.update_user_status_safe)(status)
            await self.broadcast_status_change()

    def get_user_status(self):
        if self.user:
            return self.user.status
        else:
            return ''

    async def broadcast_status_change(self):
        friends = await database_sync_to_async(self.get_friends)()
        status = await database_sync_to_async(self.get_user_status)()
        for friend_username in friends:
            await self.send_channel(friend_username, 'friend_status_change', {
                'user': self.user_username,
                'status': status
            })

    @register_ws_func
    async def logout(self, msg_obj):
        print(f"Logging out user: {self.user_username if self.user_username else 'Unknown'}")
        if self.user:
            await self.update_user_status('Offline')
            self.user = None
            self.authed = False
            self.connected = False
        await self.close()

    async def on_disconnect(self):
        await database_sync_to_async(self.clean_db_entries)()
        print(f"Disconnecting user: {self.user_username if self.user else 'Unknown'}")
        if self.authed:
            await self.update_user_status('Offline')
            await self.broadcast_status_change()
            self.user = None
            self.authed = False

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
    def get_user_by_username(friend_username):
        return JwtUser.objects.filter(username=friend_username).first()

    def username_is_blocked(self, username):
        return len(self.user.blocked_users.filter(username=username)) > 0

    def user_is_blocked(self, user: JwtUser):
        return len(self.user.blocked_users.filter(username=user.username)) > 0

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
            friend = await database_sync_to_async(self.get_user_by_username)(friend_username)
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
        return acknowledgement.match_key

    @staticmethod
    def acknowledge_request(request_id):
        acknowledgement = AcknowledgedMatchRequest.acknowledge_request(MatchRequest.objects.filter(match_key=request_id).first())
        return acknowledgement.match_key

    @staticmethod
    def acknowledge_request_waiting(author, target_username, ball_color, fast):
        try:
            target_user = JwtUser.objects.filter(username=target_username).first()
        except JwtUser.DoesNotExist:
            return None
        acknowledgement = AcknowledgedMatchRequest(
            request_author=author,
            target_user=target_user,
            ball_color=ball_color,
            fast=fast,
            is_bot=False,
            match_key=random_alphanum(10)
        )
        acknowledgement.save()
        return acknowledgement.match_key

    def request_match(self, msg_obj, friend):
        match = MatchRequest.request_match(request_author=self.user, target_user=friend,
                                   ball_color=msg_obj.get('ball_color'),
                                   fast=msg_obj.get('fast'))
        return match.id

    @staticmethod
    def get_waiting_username():
        user = GameSearchQueue.get_first_user()
        if user is None:
            return None
        else:
            GameSearchQueue.remove_user_from_queue(user)
            return user.username

    @staticmethod
    def add_user_to_queue(user):
        GameSearchQueue.add_user_to_queue(user)

    @staticmethod
    def get_available_match_request(match_author_username=None):
        # Query for the oldest MatchRequest where target_user is None and fast is False
        oldest_request = None
        if match_author_username is None:
            oldest_request: MatchRequest = MatchRequest.objects.filter(target_user__isnull=True, fast=False).order_by(
                'created_at').first()
        else:
            match_author = JwtUser.objects.filter(username=match_author_username).first()
            if match_author is None:
                return None
            oldest_request: MatchRequest = MatchRequest.objects.filter(request_author=match_author).first()
        print("Got oldest request", flush=True)
        if oldest_request:
            req_copy = AnonClass(
                request_author=AnonClass(username=oldest_request.request_author.username),
                target_user=AnonClass(username=oldest_request.target_user.username)
                                if oldest_request.target_user is not None else None,
                ball_color=oldest_request.ball_color,
                fast=oldest_request.fast,
                created_at=oldest_request.created_at,
                match_key=oldest_request.match_key
            )
            MatchRequest.objects.filter(request_author=oldest_request.request_author).delete()
            return req_copy
        return None

    def acknowledge_request_join_from_search(self, request, target):
        author = JwtUser.objects.filter(username=request.request_author.username).first()
        if author is None:
            return None
        acknowledgement = AcknowledgedMatchRequest(
            request_author=author,
            target_user=target,
            ball_color=request.ball_color,
            fast=request.fast,
            is_bot=False,
            match_key=random_alphanum(10)
        )
        acknowledgement.save()
        return acknowledgement.match_key

    @staticmethod
    def user_exists(username):
        return JwtUser.objects.filter(username=username).exists()

    def get_friend_by_username(self, friend_username):
        return self.user.friends.filter(username=friend_username).first()

    @staticmethod
    def acknowledgement_by_key(key):
        return AcknowledgedMatchRequest.objects.filter(match_key=key).first()

    @staticmethod
    def acknowledgement_to_key(acknowledgement: AcknowledgedMatchRequest):
        return acknowledgement.match_key

    # 2) server gets game request and replies to it with either a match_request_id
    #    or an acknowledgement (game start), in the case of game against AI
    @register_ws_func
    async def request_game(self, msg_obj):
        errormsg = {'type': 'request_game_resp', 'status': 'error'}
        if msg_obj.get('tournament_id') is not None:
            print(f'Got game request from tournament {msg_obj.get("tournament_id")}')
            acknowledgement = await database_sync_to_async(self.acknowledgement_by_key)(msg_obj.get("match_key"))
            if acknowledgement is None:
                return
            key = await database_sync_to_async(self.acknowledgement_to_key)(acknowledgement)
            await self.send_json({'type': 'game_acknowledgement', 'match_key': key})

        if msg_obj.get('search_for_game') is not None and msg_obj.get('search_for_game') == True:
            request = None
            if msg_obj.get('joining_author') is not None:
                request = await database_sync_to_async(self.get_available_match_request)(msg_obj.get('joining_author'))
            else:
                request = await database_sync_to_async(self.get_available_match_request)()
            if request is not None:
                print('Someone is proposing a match, joining', flush=True)
                # if someone is already proposing a match we join it
                acknowledgement_key = await database_sync_to_async(self.acknowledge_request_join_from_search)(request,
                                                                                                              self.user)
                if acknowledgement_key is None:
                    return
                await self.send_json({'type': 'game_acknowledgement', 'match_key': acknowledgement_key})
                print(f'Sending acknowledgement to author ({request.request_author}, (we are {self.user_username} (his opponent))', flush=True)
                # We need to specify the target_user because we ourselves are also subscribed to the group
                await self.send_channel(request.request_author.username, 'relay_game_acknowledgement',
                                        {'match_key': acknowledgement_key, 'target_user': request.request_author.username})
            else:
                # otherwise we add ourselves to the match search queue
                print('Adding ourselves to wait queue', flush=True)
                await database_sync_to_async(self.add_user_to_queue)(self.user)
            return
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
            if not await database_sync_to_async(self.user_exists)(msg_obj.get('target_user')):
                await self.send_json(errormsg)
                print("err3", flush=True)
                return
            friend = await database_sync_to_async(self.get_friend_by_username)(msg_obj.get('target_user'))
            if friend is None:
                await self.send_json(errormsg)
                print("err4", flush=True)
                return
            blocked = await database_sync_to_async(self.user_is_blocked)(friend)
            if blocked:
                await self.send_json(errormsg)
                print("err5 (blocked)", flush=True)
                return
            match_request_id = await database_sync_to_async(self.request_match)(msg_obj, friend)
            await self.send_json({'type': 'match_request_id', 'id': match_request_id})
        elif msg_obj.get('ai'):
            acknowledgement_key = await database_sync_to_async(self.acknowledge_bot_request)(msg_obj)
            await self.send_json({'type': 'game_acknowledgement', 'match_key': acknowledgement_key})
            return
        else:

            # Ok so here basically we should check if there are any looking players in the queue.
            # otherwise we create a match request
            waiting_username = await database_sync_to_async(self.get_waiting_username)()
            if waiting_username is None:
                match_request_id = await database_sync_to_async(self.request_match)(msg_obj, None)
                await self.send_json({'type': 'match_request_id', 'id': match_request_id})
            else:
                acknowledgement_key = await (database_sync_to_async(self.acknowledge_request_waiting)
                                             (self.user, waiting_username, msg_obj.get('ball_color'),
                                              msg_obj.get('fast')))
                if acknowledgement_key is None:
                    return
                # TODO: see if we can share an acknowledgement. I guess yeah? the opponent doesn't need the acknowledgement
                await self.send_json({'type': 'game_acknowledgement', 'match_key': acknowledgement_key})
                await self.send_channel(waiting_username, 'relay_game_acknowledgement',
                                        {'match_key': acknowledgement_key,
                                         'target_user': waiting_username})

    @register_ws_func
    async def navigating_to(self, msg_obj):
        print(f'navigating_to: {msg_obj}', flush=True)
        if msg_obj.get('url') is None:
            return
        if 'local-game' not in msg_obj.get('url'):
            print('Clearing db because we opened a non local game page', flush=True)
            await database_sync_to_async(self.clean_db_entries)()

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

    async def friend_status_change(self, event):
        msg_obj = event["msg_obj"]
        print(f"Received friend status change: {msg_obj}")
        await self.send_json({
            'type': 'friend_status_update',
            'username': msg_obj['user'],
            'status': msg_obj['status']
        })

    async def relay_game_acknowledgement(self, event):
        msg_obj = event["msg_obj"]
        if msg_obj.get('target_user') is None or msg_obj.get('match_key') is None:
            return
        if msg_obj.get('target_user') != self.user_username:
            return
        await self.send_json({'type': 'game_acknowledgement', 'match_key': msg_obj.get('match_key')})

    async def toast(self, event):
        msg_obj = event["msg_obj"]
        if msg_obj.get('target_user') is None:
            return
        if msg_obj.get('target_user') != self.user_username:
            return
        await self.send_json({'type': 'toast', 'localization': msg_obj.get('localization')})