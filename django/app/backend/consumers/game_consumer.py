import asyncio
import json

from backend.models import AcknowledgedMatchRequest, JwtUser, Tournament, GameHistory
from backend.consumers.consumer_util import WsConsumerCommon, register_ws_func
from backend.consumers.game_controller import GameController
from backend.util import random_bot_name
from django.utils import timezone

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
        self.tournament_id = None
        self.author_nickname = None
        self.opponent_nickname = None
        self.voluntary_disconnect: bool = False
        self.received_over = False

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

    @staticmethod
    def report_tournament_win(nickname, tournament_id):
        Tournament.report_results(nickname, tournament_id)

    async def on_auth(self, msg_obj):
        print('Received auth message', flush=True)
        if msg_obj.get('match_key') is None:
            await self.close()
            return

        self.start_time = timezone.now()
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
        self.tournament_id = acknowledgement.tournament_id
        self.author_nickname = acknowledgement.author_nickname
        self.opponent_nickname = acknowledgement.opponent_nickname

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
        bot_name = random_bot_name()
        if self.opponent_nickname is not None and self.opponent_nickname.startswith('bot:'):
            bot_name = self.opponent_nickname[len('bot:'):]
        bot_name += " (BOT)"
        a_nickname = None
        if self.author_nickname is not None:
            if self.author_nickname.startswith('user'):
                a_nickname = self.author_nickname.split(':')[2]
            if self.author_nickname.startswith('bot'):
                a_nickname = self.author_nickname.split(':')[1] + ' (BOT)'
        o_nickname = None
        if self.opponent_nickname is not None:
            if self.opponent_nickname.startswith('user'):
                o_nickname = self.opponent_nickname.split(':')[2]
            if self.opponent_nickname.startswith('bot'):
                o_nickname = self.opponent_nickname.split(':')[1] + ' (BOT)'
        await self.send_json({
            'type': 'start',
            'ball_color': self.ball_color,
            'is_bot': self.is_bot,
            'author': request_author_username,
            'opponent': self.opponent.username if self.opponent else bot_name,
            'fast': self.fast,
            'author_nickname': a_nickname,
            'opponent_nickname': o_nickname})

    async def on_disconnect(self):
        print(f'{self.user.username} on_disconnect', flush=True)
        try:
            await self.send_json({'type': 'game_bye', 'msg_obj': {}})
        except Exception as e:
            print(e)
        if self.game_controller is not None:
            await self.game_controller.stop()
        if not self.voluntary_disconnect:
            print(f'Disconnect was not voluntary, sending player_disconnect who={self.user_username}')
            if self.game_controller is not None:
                await self.player_disconnect({"msg_obj": {'who': self.user_username}})
            else:
                await self.send_channel(self.author_channel, 'player_disconnect', {'who': self.user_username})

    @register_ws_func
    async def ping(self, msg_obj):
        try:
            await self.send(text_data=json.dumps({'pong': 'pong'}))
        except:
            pass

    @register_ws_func
    def join(self, msg_obj):
        pass

    @register_ws_func
    async def client_update(self, msg_obj):
        msg_obj['username'] = self.user.username
        if self.game_controller is not None:
            await self.game_controller.client_update_relay(msg_obj)
        else:
            await self.send_channel(self.opponent_channel, 'opponent_update', msg_obj)

    async def opponent_update(self, msg_obj):
        if self.opponent is None:
            return
        if self.opponent.username == self.user.username:
            return
        if msg_obj.get('msg_obj') is None:
            return
        await self.game_controller.client_update_relay(msg_obj.get('msg_obj'))

    async def relay_from_controller(self, event):
        if event['msg_obj'].get('over') is not None:
            if self.received_over:
                return
            else:
                self.received_over = True
            print(f'{self.user.username} received OVER', flush=True)
            self.voluntary_disconnect = True

            if self.game_controller is not None:
                print(f'Handling who won, author ({self.user.username}) score: {self.game_controller.author_score}.'
                      f' opponent ({self.opponent.username if self.opponent is not None else "BOT"}) score: {self.game_controller.opponent_score}', flush=True)
                if self.game_controller.author_score >= 3:
                    # author won
                    await self.user_won(self.user)
                else:
                    #opponent won
                    await self.user_won(self.opponent)

            await self.disconnect(0)
        else:
            try:
                await self.send(text_data=json.dumps(event["msg_obj"]))
            except:
                pass

    async def gentle_disconnect(self, event):
        print(f'({self.user_username}) Received Gentle disconnect', flush=True)
        print(event, flush=True)
        msg_obj = event["msg_obj"]
        print(msg_obj, flush=True)
        if msg_obj.get('target_user') is None:
            print('target_user was not received', flush=True)
            return
        if msg_obj.get('target_user') != self.user_username:
            print('target_user was not self', flush=True)
            return

        try:
            await self.send_json({'type': 'game_bye', 'msg_obj': {}})
        except:
            pass
        self.voluntary_disconnect = True
        await self.disconnect(0)

    async def player_disconnect(self, event):
        print(f'({self.user_username}) Received Player disconnect', flush=True)
        if self.game_controller is None:
            print('Received Player disconnect at opponent, returning', flush=True)
            return

        if event['msg_obj'].get('who') is None:
            print('who was not received', flush=True)
            return

        # if author disconnects
        if event['msg_obj'].get('who') == self.user_username:
            print('Author disconnected', flush=True)
            # Opponent wins
            await self.user_won(self.opponent)
            if self.opponent is not None:
                await self.send_channel(self.opponent_channel, 'gentle_disconnect',
                                    {"target_user": self.opponent.username})
        # if opponent disconnects
        else:
            print('Opponent disconnected', flush=True)
            # Author wins
            await self.user_won(self.user)
            await self.send_channel(self.author_channel, 'gentle_disconnect',
                                    {"target_user": self.user_username})
        try:
            await self.send_json({'type': 'game_bye', 'msg_obj': {}})
        except:
            pass
        self.voluntary_disconnect = True
        await self.disconnect(0)

    @database_sync_to_async
    def save_game_history(self, joueur1_username, joueur2_username, duree_partie, score_joueur1, score_joueur2,
                          gagnant_username, is_ai_opponent, ai_opponent_name):
        return GameHistory.enregistrer_partie(
            joueur1_username=joueur1_username,
            joueur2_username=joueur2_username,
            duree_partie=duree_partie,
            score_joueur1=score_joueur1,
            score_joueur2=score_joueur2,
            is_ai_opponent=is_ai_opponent,
            ai_opponent_name=ai_opponent_name,
            gagnant_username=gagnant_username
        )

    async def user_won(self, who):
        print(f'Noting that user {who.username if who else "BOT"} won', flush=True)

        # Calculer la durée de la partie
        duration = int((timezone.now() - self.start_time).total_seconds())

        # Déterminer les scores
        score_joueur1 = self.game_controller.author_score
        score_joueur2 = self.game_controller.opponent_score

        # Déterminer le nom de l'adversaire IA si applicable
        ai_opponent_name = None
        try:
            if self.is_bot:
                ai_opponent_name = self.opponent_nickname.split(' (BOT)')[0] if self.opponent_nickname else "AI Opponent"
        except Exception as e:
            pass
        # Sauvegarder l'historique de la partie
        await self.save_game_history(
            joueur1_username=self.user.username if self.user else None,
            joueur2_username=self.opponent.username if self.opponent else None,
            duree_partie=duration,
            score_joueur1=score_joueur1,
            score_joueur2=score_joueur2,
            is_ai_opponent=self.is_bot,
            ai_opponent_name=ai_opponent_name,
            gagnant_username=who.username if who else None
        )

        # Gestion du tournoi si applicable
        if self.tournament_id is not None:
            if who == self.user:
                print(f'Sending tournament report that {who.username} ({self.author_nickname}) won', flush=True)
                await database_sync_to_async(self.report_tournament_win)(self.author_nickname, self.tournament_id)
            else:
                print(f'Sending tournament report that {self.opponent_nickname} won', flush=True)
                await database_sync_to_async(self.report_tournament_win)(self.opponent_nickname, self.tournament_id)

        # Envoyer des notifications aux joueurs
        if who == self.user:
            await self.send_channel(self.user.username, 'toast',
                                    {"localization": f"%youWonGame%", "target_user": self.user.username})
            if self.opponent is not None:
                await self.send_channel(self.opponent.username, 'toast',
                                    {"localization": f"%youLostGame%", "target_user": self.opponent.username})
        else:
            if self.opponent is not None:
                await self.send_channel(self.opponent.username, 'toast',
                                    {"localization": f"%youWonGame%", "target_user": self.opponent.username})
            await self.send_channel(self.user.username, 'toast',
                                    {"localization": f"%youLostGame%", "target_user": self.user.username})
            

    @register_ws_func
    async def game_over(self, msg_obj):
        # Cette méthode est appelée lorsque le message 'game_over' est reçu
        # Vous pouvez l'utiliser pour des mises à jour en temps réel si nécessaire
        pass

  