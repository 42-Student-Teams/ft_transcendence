from backend.models import (JwtUser, Message, MatchRequest, AcknowledgedMatchRequest, GameSearchQueue,
                            TournamentPvPQueue, TournamentSearchQueue, Tournament)
from backend.util import timestamp_now, random_alphanum, AnonClass
from backend.consumers.consumer_util import WsConsumerCommon, register_ws_func

from asgiref.sync import async_to_sync
from channels.db import database_sync_to_async
from channels.layers import get_channel_layer

from app.settings import logger

class WsConsumer(WsConsumerCommon):
    def __init__(self, *args, **kwargs):
        super().__init__(*args, **kwargs)

    def clean_db_entries(self, was_reload):
        logger.debug(f'Cleaning db entries for user {self.user.username}')
        MatchRequest.objects.filter(request_author=self.user).delete()

        if was_reload:
            tournaments = Tournament.objects.all()
            channel_layer = get_channel_layer()
            for tournament in tournaments:
                logger.debug(f'Deleting user {self.user.username} from tournament {tournament.id}')
                for entry in tournament.waitlist:
                    if entry.startswith(f'user:{self.user.username}'):
                        tournament.amount_players_quit += 1
                        tournament.save()
                tournament.remove_from_waitlist(self.user.username)
                acknowledgements: list[AcknowledgedMatchRequest] = AcknowledgedMatchRequest.objects.filter(tournament_id=tournament.id)
                for acknowledgement in acknowledgements:
                    logger.debug(f'checking acknowledgement from username {self.user.username}: {acknowledgement.request_author.username}')
                    if self.user.username == acknowledgement.request_author.username:
                        Tournament.report_results(acknowledgement.opponent_nickname, acknowledgement.author_nickname, tournament.id)
                        logger.debug(f'Reporting nickname {acknowledgement.opponent_nickname} as winning to tournament {tournament.id}')
                    elif acknowledgement.target_user is not None and self.user.username == acknowledgement.target_user.username:
                        Tournament.report_results(acknowledgement.author_nickname, acknowledgement.opponent_nickname, tournament.id)
                        logger.debug(
                            f'Reporting nickname {acknowledgement.author_nickname} as winning to tournament {tournament.id}')
                    #elif acknowledgement.is_bot and self.user.username == acknowledgement.request_author.username:
                    #    Tournament.report_results(acknowledgement.opponent_nickname, tournament.id)
                    '''async_to_sync(channel_layer.group_send)(acknowledgement.request_author.username,
                                                            {"type": "relay_bye", "msg_obj": {
                                                                "target_user": acknowledgement.request_author.username,
                                                                "match_key": acknowledgement.match_key,
                                                            }})
                    if acknowledgement.target_user is not None:
                        async_to_sync(channel_layer.group_send)(acknowledgement.target_user.username,
                                                            {"type": "relay_bye", "msg_obj": {
                                                                "target_user": acknowledgement.target_user.username,
                                                                "match_key": acknowledgement.match_key,
                                                            }})'''
                    if self.user.username == acknowledgement.request_author.username and acknowledgement.target_user is not None:
                        async_to_sync(channel_layer.group_send)(acknowledgement.target_user.username,
                                                                {"type": "toast", "msg_obj": {
                                                                    "localization": f"{self.user.username} %opponentAbandoned%",
                                                                    "target_user": acknowledgement.target_user.username}})
                    if acknowledgement.target_user is not None and self.user.username == acknowledgement.target_user.username:
                        async_to_sync(channel_layer.group_send)(acknowledgement.request_author.username,
                                                                {"type": "toast", "msg_obj": {
                                                                    "localization": f"{self.user.username} %opponentAbandoned%",
                                                                    "target_user": acknowledgement.request_author.username}})

            AcknowledgedMatchRequest.objects.filter(request_author=self.user).delete()
            TournamentPvPQueue.objects.filter(user=self.user).delete()
        GameSearchQueue.objects.filter(user=self.user).delete()
        TournamentSearchQueue.objects.filter(user=self.user).delete()

    async def on_auth(self, msg_obj):
        await self.subscribe_to_groups()
        await self.update_user_status('Connected')

    def update_user_status_safe(self, status):
        if self.user:
            logger.debug(f"Updating status for user {self.user.username} to {status}")
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
        logger.debug(f"Logging out user: {self.user_username if self.user_username else 'Unknown'}")
        if self.user:
            await self.update_user_status('Offline')
            #self.user = None
            self.authed = False
            self.connected = False
        await self.close()

    async def on_disconnect(self):
        logger.debug(f"Disconnecting user: {self.user_username if self.user else 'Unknown'}")
        await database_sync_to_async(self.clean_db_entries)(True)
        if self.authed:
            await self.update_user_status('Offline')
            await self.broadcast_status_change()
            # self.user = None
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
        logger.debug(f'SUBSCRIBE: {self.user.username}')
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
        logger.debug(f"Got message command: to: {msg_obj.get('friend_username')}, message: {msg_obj.get('message')}")
        friend_username = msg_obj.get('friend_username')
        if friend_username is None or msg_obj.get('message') is None:
            return
        try:
            friend = await database_sync_to_async(self.get_user_by_username)(friend_username)
        except JwtUser.DoesNotExist:
            return
        blocked = await database_sync_to_async(self.username_is_blocked)(friend_username)
        if blocked:
            logger.debug(f'BLOCKED: {friend_username}, not sending message')
            return
        await database_sync_to_async(self.create_message)(friend, msg_obj.get('message'))
        msg_obj['author'] = self.user.username
        logger.debug(f"Relaying message {msg_obj.get('message')} to channel")
        logger.debug('Groups I\'m in:')
        logger.debug(self.subscribed_groups)
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
            oldest_request: MatchRequest = MatchRequest.objects.filter(target_user__isnull=True).order_by(
                'created_at').first()
        else:
            match_author = JwtUser.objects.filter(username=match_author_username).first()
            if match_author is None:
                return None
            oldest_request: MatchRequest = MatchRequest.objects.filter(request_author=match_author).first()
        logger.debug("Got oldest request")
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
    def handle_acknowledgement(acknowledgement: AcknowledgedMatchRequest, user):
        key = acknowledgement.match_key
        if acknowledgement.is_bot:
            return [key, acknowledgement.opponent_nickname]
        logger.debug(f'Key: {key}')
        waiting: TournamentPvPQueue = TournamentPvPQueue.objects.filter(match_key=key).first()
        if waiting is None:
            logger.debug('waiting is None')
            TournamentPvPQueue.add_user_to_queue(user, key)
        else:
            username = waiting.user.username
            waiting.delete()
            return [key, username]
        return [None, None]

    # 2) server gets game request and replies to it with either a match_request_id
    #    or an acknowledgement (game start), in the case of game against AI
    @register_ws_func
    async def request_game(self, msg_obj):
        errormsg = {'type': 'request_game_resp', 'status': 'error'}
        if msg_obj.get('tournament_id') is not None:
            logger.debug(f'Got game request from tournament {msg_obj.get("tournament_id")}')
            acknowledgement = await database_sync_to_async(self.acknowledgement_by_key)(msg_obj.get("match_key"))
            if acknowledgement is None:
                return
            key, waiting_username = await database_sync_to_async(self.handle_acknowledgement)(acknowledgement, self.user)
            logger.debug(key, waiting_username)
            if key is not None:
                logger.debug('!! sending game_acknowledgements')
                await self.send_json({'type': 'game_acknowledgement', 'match_key': key})
                if not waiting_username.startswith('bot:'):
                    await self.send_channel(waiting_username, 'relay_game_acknowledgement',
                                        {'match_key': key,
                                         'target_user': waiting_username})

        if msg_obj.get('search_for_game') is not None and msg_obj.get('search_for_game') == True:
            request = None
            if msg_obj.get('joining_author') is not None:
                request = await database_sync_to_async(self.get_available_match_request)(msg_obj.get('joining_author'))
            else:
                request = await database_sync_to_async(self.get_available_match_request)()
            if request is not None:
                logger.debug('Someone is proposing a match, joining')
                # if someone is already proposing a match we join it
                acknowledgement_key = await database_sync_to_async(self.acknowledge_request_join_from_search)(request,
                                                                                                              self.user)
                if acknowledgement_key is None:
                    return
                await self.send_json({'type': 'game_acknowledgement', 'match_key': acknowledgement_key})
                logger.debug(f'Sending acknowledgement to author ({request.request_author}, (we are {self.user_username} (his opponent))')
                # We need to specify the target_user because we ourselves are also subscribed to the group
                await self.send_channel(request.request_author.username, 'relay_game_acknowledgement',
                                        {'match_key': acknowledgement_key, 'target_user': request.request_author.username})
            else:
                # otherwise we add ourselves to the match search queue
                logger.debug('Adding ourselves to wait queue')
                await database_sync_to_async(self.add_user_to_queue)(self.user)
            return
        if msg_obj.get('ball_color') is None or msg_obj.get('ball_color') not in ['black', 'blue', 'red']:
            msg_obj['ball_color'] = 'black'
        if msg_obj.get('fast') is None:
            msg_obj['fast'] = False
        if msg_obj.get('ai') is None:
            await self.send_json(errormsg)
            logger.debug("err1")
            return
        if msg_obj.get('ai') is None and msg_obj.get('target_user') is None:
            await self.send_json(errormsg)
            logger.debug("err2")
            return
        if msg_obj.get('target_user') is not None:
            if not await database_sync_to_async(self.user_exists)(msg_obj.get('target_user')):
                await self.send_json(errormsg)
                logger.debug("err3")
                return
            friend = await database_sync_to_async(self.get_friend_by_username)(msg_obj.get('target_user'))
            if friend is None:
                await self.send_json(errormsg)
                logger.debug("err4")
                return
            blocked = await database_sync_to_async(self.user_is_blocked)(friend)
            if blocked:
                await self.send_json(errormsg)
                logger.debug("err5 (blocked)")
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
                await self.send_json({'type': 'game_acknowledgement', 'match_key': acknowledgement_key})
                await self.send_channel(waiting_username, 'relay_game_acknowledgement',
                                        {'match_key': acknowledgement_key,
                                         'target_user': waiting_username})

    @register_ws_func
    async def navigating_to(self, msg_obj):
        logger.debug(f'navigating_to: {msg_obj}')
        if msg_obj.get('url') is None:
            return
        if 'local-game' not in msg_obj.get('url'):
            logger.debug('Clearing db because we opened a non local game page')
            await database_sync_to_async(self.clean_db_entries)(False)

    # CHANNEL RECEIVERS
    async def channel_dm(self, event):
        logger.debug("Got dm on channel")
        msg_obj = event["msg_obj"]
        if msg_obj.get('friend_username') == self.user_username:
            # it could contain more fields, which is not desirable
            sanitized_msg_obj = {
                'type': 'dm',
                'author': msg_obj.get('author'),
                'message': msg_obj.get('message'),
            }
            logger.debug(f'Sending the json from channel_dm ({self.user_username})')
            await self.send_json(sanitized_msg_obj)

    async def friend_status_change(self, event):
        msg_obj = event["msg_obj"]
        logger.debug(f"Received friend status change: {msg_obj}")
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

    async def relay_bye(self, event):
        logger.debug(f"Received relay bye: {event}")
        msg_obj = event["msg_obj"]
        if msg_obj.get('target_user') is None or msg_obj.get('match_key') is None:
            return
        if msg_obj.get('target_user') != self.user_username:
            return
        msg_obj['type'] = 'game_bye'
        await self.send_json(msg_obj)

    async def toast(self, event):
        msg_obj = event["msg_obj"]
        if msg_obj.get('target_user') is None:
            return
        if msg_obj.get('target_user') != self.user_username:
            return
        await self.send_json({'type': 'toast', 'localization': msg_obj.get('localization')})

    async def tournament_game_invite(self, event):
        msg_obj = event["msg_obj"]
        if msg_obj.get('target_user') is None or msg_obj.get('match_key') is None or msg_obj.get('tournament_id') is None:
            return
        if msg_obj.get('target_user') != self.user_username:
            return
        await self.send_json({'type': 'tournament_game_invite', 'match_key': msg_obj.get('match_key'), 'tournament_id': msg_obj.get('tournament_id')})