import random

from django.utils import timezone
from django.contrib.auth.models import AbstractUser
from django.db import models
from django.db.models import Q

from .util import timestamp_now, random_alphanum, AnonClass


class JwtUser(AbstractUser):
    first_name = models.CharField(max_length=12)
    last_name = models.CharField(max_length=12)
    username = models.CharField(unique=True, max_length=12)
    email = models.EmailField(unique=True, null=True, blank=True)
    password = models.CharField(max_length=128)
    isoauth = models.BooleanField(default=False)
    friends = models.ManyToManyField('self', symmetrical=False, blank=True, related_name='user_friends')
    friend_requests = models.ManyToManyField('self', symmetrical=False, blank=True, related_name='pending_friend_requests')
    blocked_users = models.ManyToManyField('self', symmetrical=False, blank=True, related_name='blocked_by')
    avatar = models.ImageField(max_length=200, default="staticfiles/avatars/default_avatar.png", upload_to='staticfiles/avatars/')
    status = models.CharField(max_length=20, default='Offline')

    USERNAME_FIELD = 'username'
    REQUIRED_FIELDS = ['email']
    REQUIRED_FIELDS = []
    

    def get_last_x_messages_with_friend(self, friend, count, start_from_id=None):
        query = Message.objects.filter(
            Q(author_id=self.id, recipient_id=friend.id) |
            Q(author_id=friend.id, recipient_id=self.id)
        )

        if start_from_id is not None:
            query = query.filter(id__lte=start_from_id)

        messages = query.order_by('-id')[:count]

        return messages


class Message(models.Model):
    author = models.ForeignKey(JwtUser, on_delete=models.CASCADE, related_name='sent_messages')
    recipient = models.ForeignKey(JwtUser, on_delete=models.CASCADE, related_name='received_messages')
    content = models.TextField()
    timestamp = models.FloatField()

    def __str__(self):
        return f'Message from {self.author} to {self.recipient} at {self.timestamp}'

    def get_messages_with_friend(self, friend, start_id, count):
        messages = Message.objects.filter(
            Q(author_id=self.id, recipient_id=friend.id) |
            Q(author_id=friend.id, recipient_id=self.id),
            id__gte=start_id
        ).order_by('id')[:count]

        return messages


# Ajout du modèle GameHistory
class GameHistory(models.Model):
    date_partie = models.DateTimeField(default=timezone.now)
    joueur1 = models.ForeignKey('JwtUser', on_delete=models.CASCADE, related_name='parties_joueur1')
    joueur2 = models.ForeignKey('JwtUser', on_delete=models.CASCADE, related_name='parties_joueur2', null=True, blank=True)
    duree_partie = models.IntegerField()
    score_joueur1 = models.IntegerField()
    score_joueur2 = models.IntegerField()
    gagnant = models.ForeignKey('JwtUser', on_delete=models.CASCADE, related_name='parties_gagnees', null=True, blank=True)
    is_ai_opponent = models.BooleanField(default=False)
    ai_opponent_name = models.CharField(max_length=100, null=True, blank=True)

    def save(self, *args, **kwargs):
        # Détermination du gagnant avant la sauvegarde
        if self.score_joueur1 > self.score_joueur2:
            self.gagnant = self.joueur1
        elif self.score_joueur2 > self.score_joueur1:
            self.gagnant = self.joueur2 if not self.is_ai_opponent else None
        super().save(*args, **kwargs)

    @classmethod
    def enregistrer_partie(cls, joueur1, joueur2, duree_partie, score_joueur1, score_joueur2, is_ai_opponent=False, ai_opponent_name=None):
        partie = cls(
            joueur1=joueur1,
            joueur2=joueur2,
            duree_partie=duree_partie,
            score_joueur1=score_joueur1,
            score_joueur2=score_joueur2,
            is_ai_opponent=is_ai_opponent,
            ai_opponent_name=ai_opponent_name
        )
        partie.save()
        return partie

    def __str__(self):
        if self.is_ai_opponent:
            return f"Partie entre {self.joueur1.username} et IA ({self.ai_opponent_name}) le {self.date_partie}"
        return f"Partie entre {self.joueur1.username} et {self.joueur2.username} le {self.date_partie}"


class MatchRequest(models.Model):
    request_author = models.ForeignKey(JwtUser, related_name='match_requests_authored', on_delete=models.CASCADE)
    target_user = models.ForeignKey(JwtUser, related_name='match_requests_targeted', on_delete=models.SET_NULL, null=True,
                                    blank=True)
    ball_color = models.CharField(max_length=50)
    fast = models.BooleanField(default=False)
    created_at = models.FloatField()
    match_key = models.CharField(null=True)

    def __str__(self):
        return f"{self.request_author} vs {self.target_user if self.target_user else 'Anyone'}"

    @staticmethod
    def request_match(request_author, target_user, ball_color, fast):
        MatchRequest.objects.filter(request_author=request_author).delete()
        match_request = MatchRequest(
            request_author=request_author,
            target_user=target_user,
            ball_color=ball_color,
            fast=fast,
            created_at=timestamp_now()
        )
        match_request.save()
        return match_request


class AcknowledgedMatchRequest(models.Model):
    request_author = models.ForeignKey(JwtUser, related_name='acknowledged_match_requests_authored', on_delete=models.CASCADE)
    target_user = models.ForeignKey(JwtUser, related_name='acknowledged_match_requests_targeted', on_delete=models.SET_NULL, null=True,
                                    blank=True)
    ball_color = models.CharField(max_length=50)
    fast = models.BooleanField(default=False)
    is_bot = models.BooleanField(default=False)
    match_key = models.CharField(null=True)

    tournament_id = models.IntegerField(null=True)
    opponent_nickname = models.CharField(null=True)
    author_nickname = models.CharField(null=True)

    def __str__(self):
        return f"{self.request_author} vs {self.target_user if self.target_user else 'Anyone'}"

    @staticmethod
    def acknowledge_request(request: MatchRequest):
        MatchRequest.objects.filter(request_author=request.request_author).delete()
        acknowledgement = AcknowledgedMatchRequest(
            request_author=request.request_author,
            target_user=request.target_user,
            ball_color=request.ball_color,
            fast=request.fast,
            is_bot=False,
            match_key=random_alphanum(10)
        )
        acknowledgement.save()
        return acknowledgement

    @staticmethod
    def acknowledge_bot_request(request_author, target_user, ball_color, fast):
        MatchRequest.objects.filter(request_author=request_author).delete()
        acknowledgement = AcknowledgedMatchRequest(
            request_author=request_author,
            target_user=target_user,
            ball_color=ball_color,
            fast=fast,
            is_bot=True,
            match_key=random_alphanum(10)
        )
        acknowledgement.save()
        return acknowledgement

    @staticmethod
    def create_safe_copy(acknowledgement):
        return AnonClass(
            request_author=AnonClass(username=acknowledgement.request_author.username),
            target_user=AnonClass(username=acknowledgement.target_user.username) if acknowledgement.target_user else None,
            ball_color=acknowledgement.ball_color,
            fast=acknowledgement.fast,
            is_bot=acknowledgement.is_bot,
            match_key=acknowledgement.match_key,
            tournament_id=acknowledgement.tournament_id,
            opponent_nickname=acknowledgement.opponent_nickname,
            author_nickname=acknowledgement.author_nickname,
        )


class GameSearchQueue(models.Model):
    user = models.OneToOneField(JwtUser, on_delete=models.CASCADE, related_name='game_search_queue')

    @classmethod
    def add_user_to_queue(cls, user):
        # Add the user to the queue if not already in it
        if not cls.objects.filter(user=user).exists():
            cls.objects.create(user=user)

    @classmethod
    def remove_user_from_queue(cls, user):
        # Remove the user from the queue if they are in it
        cls.objects.filter(user=user).delete()

    @classmethod
    def is_user_in_queue(cls, user):
        # Check if the user is already in the queue
        return cls.objects.filter(user=user).exists()

    @classmethod
    def get_first_user(cls):
        first_entry = cls.objects.first()
        if first_entry is not None:
            return first_entry.user
        return None


class TournamentSearchQueue(models.Model):
    user = models.OneToOneField(JwtUser, on_delete=models.CASCADE, related_name='tournament_search_queue')
    nickname = models.CharField(max_length=255)

    @classmethod
    def add_user_to_queue(cls, user, nickname):
        # Add the user to the queue if not already in it
        if not cls.objects.filter(user=user).exists():
            cls.objects.create(user=user, nickname=nickname)

    @classmethod
    def remove_user_from_queue(cls, user):
        # Remove the user from the queue if they are in it
        cls.objects.filter(user=user).delete()

    @classmethod
    def is_user_in_queue(cls, user):
        # Check if the user is already in the queue
        return cls.objects.filter(user=user).exists()

    @classmethod
    def get_up_to_x_users(cls, x):
        # Get up to x users from the queue
        queue_entries = cls.objects.all()[:x]
        res = [(entry.user, entry.nickname) for entry in queue_entries]
        for user, _ in res:
            cls.remove_user_from_queue(user)
        return res


class TournamentPvPQueue(models.Model):
    user = models.OneToOneField(JwtUser, on_delete=models.CASCADE, related_name='tournament_pvp_queue')
    match_key = models.CharField(max_length=255)

    @classmethod
    def add_user_to_queue(cls, user, match_key):
        # Add the user to the queue if not already in it
        if not cls.objects.filter(user=user).exists():
            cls.objects.create(user=user, match_key=match_key)

    @classmethod
    def remove_user_from_queue(cls, user):
        # Remove the user from the queue if they are in it
        cls.objects.filter(user=user).delete()

    @classmethod
    def is_user_in_queue(cls, user):
        # Check if the user is already in the queue
        return cls.objects.filter(user=user).exists()

    @classmethod
    def get_user_by_key(cls, match_key):
        # Get up to x users from the queue
        return cls.objects.filter(match_key=match_key)


class Tournament(models.Model):
    op_lock = models.BooleanField(default=False)
    name = models.CharField(max_length=255)
    initiated_by = models.ForeignKey(JwtUser, on_delete=models.CASCADE, related_name='tournaments_initiated')
    ball_color = models.CharField(max_length=50)
    fast = models.BooleanField(default=False)
    created_at = models.DateTimeField(default=timezone.now)

    waitlist = models.JSONField(default=list, blank=True)  # This stores usernames and bot names
    # Format: 'user:username:nick name' for users and 'bot:bot nickname' for bots
    active_participants_count = models.IntegerField(default=-1)
    all_participants_count = models.IntegerField(default=0)
    subscribed_count = models.IntegerField(default=0)

    def add_to_waitlist(self, username):
        """Add a user or bot (identified by username) to the waitlist."""
        self.waitlist.append(username)
        self.save()

    def remove_from_waitlist(self, username):
        """Remove a user or bot from the waitlist."""
        to_remove = None
        for username_str in self.waitlist:
            if not username_str.startswith('user:'):
                continue
            if username == username_str[len('user:'):username_str.rfind(':')]:
                to_remove = username_str
                break
        if to_remove is not None:
            self.waitlist.remove(to_remove)
            self.save()

    @staticmethod
    def report_results(winner, tournament_id):
        tournament = Tournament.objects.filter(id=tournament_id).first()
        if tournament is None:
            print(f'Tournament not found {tournament_id}')
            return
        print(f'Received winner {winner}')
        tournament.active_participants_count -= 1
        print(f'Reducing active_participants (1), now it\'s {tournament.active_participants_count}', flush=True)
        tournament.waitlist.append(winner)
        tournament.save()

    def pair_and_notify(self):
        if self.subscribed_count < self.all_participants_count:
            return
        if self.active_participants_count == -1:
            self.active_participants_count = self.all_participants_count
        self.op_lock = True
        self.save()
        from asgiref.sync import async_to_sync
        from channels.layers import get_channel_layer
        channel_layer = get_channel_layer()

        if self.active_participants_count == 1:
            if len(self.waitlist) > 0:
                user = self.waitlist.pop(0)
                if user.startswith('user:'):
                    username = user[len('user:'):user.rfind(':')]
                    user_obj = JwtUser.objects.filter(username=username).first()
                    if user_obj is not None:
                        print(f'Sending WON to {user_obj.username}', flush=True)
                        async_to_sync(channel_layer.group_send)(user_obj.username,
                                                                {"type": "toast", "msg_obj": {
                                                                "localization": f"%youWonTournament% {self.name}",
                                                                 "target_user": user_obj.username}})
            print(f'Deleting tournament {self.id} (1)', flush=True)
            self.__class__.objects.filter(id=self.id).delete()
            return
        elif self.active_participants_count < 1:
            print(f'Deleting tournament {self.id} (2)', flush=True)
            self.__class__.objects.filter(id=self.id).delete()
            return

        while len(self.waitlist) > 1:
            user1 = self.waitlist.pop(0)
            user2 = self.waitlist.pop(0)

            print(f'Tournament id {self.id}, pairing {user1} and {user2}!', flush=True)

            if user1.startswith('bot:') and user2.startswith('bot:'):
                winner = random.choice([user1, user2])
                print(f'Bot {winner} wins', flush=True)
                self.waitlist.append(winner)
                self.active_participants_count -= 1
                print(f'Reducing active_participants (2), now it\'s {self.active_participants_count}', flush=True)
            elif user1.startswith('bot:') and user2.startswith('user:') or user1.startswith('user:') and user2.startswith('bot:'):
                bot_user = user1 if user1.startswith('bot:') else user2
                real_user = user1 if user1.startswith('user:') else user2

                real_username = real_user[len('user:'):real_user.rfind(':')]
                real_user_obj: JwtUser = JwtUser.objects.filter(username=real_username).first()
                if real_user_obj is None:
                    self.waitlist.append(bot_user)
                    self.active_participants_count -= 1
                    print(f'Reducing active_participants (3), now it\'s {self.active_participants_count}', flush=True)
                    continue
                acknowledgement = AcknowledgedMatchRequest(
                    request_author=real_user_obj,
                    target_user=None,
                    ball_color=self.ball_color,
                    fast=self.fast,
                    is_bot=True,
                    match_key=random_alphanum(10),
                    tournament_id=self.id,
                    opponent_nickname=bot_user,
                    author_nickname=real_user,
                )
                acknowledgement.save()
                async_to_sync(channel_layer.group_send)(real_user_obj.username,
                                                        {"type": "tournament_game_invite", "msg_obj": {
                                                         "match_key": acknowledgement.match_key,
                                                            "tournament_id": self.id,
                                                         "target_user": real_user_obj.username}})
            else:
                real_username1 = user1[len('user:'):user1.rfind(':')]
                real_user1_obj: JwtUser = JwtUser.objects.filter(username=real_username1).first()
                real_username2 = user2[len('user:'):user2.rfind(':')]
                real_user2_obj: JwtUser = JwtUser.objects.filter(username=real_username2).first()
                if real_user1_obj is None and real_user2_obj is not None:
                    self.waitlist.append(user2)
                    self.active_participants_count -= 1
                    print(f'Reducing active_participants (4), now it\'s {self.active_participants_count}', flush=True)
                    continue
                elif real_user2_obj is None and real_user1_obj is not None:
                    self.waitlist.append(user1)
                    self.active_participants_count -= 1
                    print(f'Reducing active_participants (5), now it\'s {self.active_participants_count}', flush=True)
                    continue
                elif real_user1_obj is None and real_user2_obj is None:
                    self.active_participants_count -= 2
                    print(f'Reducing active_participants (by two) (6), now it\'s {self.active_participants_count}', flush=True)
                    continue

                acknowledgement = AcknowledgedMatchRequest(
                    request_author=real_user1_obj,
                    target_user=real_user2_obj,
                    ball_color=self.ball_color,
                    fast=self.fast,
                    is_bot=False,
                    match_key=random_alphanum(10),
                    tournament_id=self.id,
                    opponent_nickname=user2,
                    author_nickname=user1,
                )
                acknowledgement.save()
                async_to_sync(channel_layer.group_send)(real_user1_obj.username,
                                                        {"type": "tournament_game_invite", "msg_obj": {
                                                         "match_key": acknowledgement.match_key,
                                                            "tournament_id": self.id,
                                                         "target_user": real_user1_obj.username}})
                async_to_sync(channel_layer.group_send)(real_user2_obj.username,
                                                        {"type": "tournament_game_invite", "msg_obj": {
                                                         "match_key": acknowledgement.match_key,
                                                            "tournament_id": self.id,
                                                         "target_user": real_user2_obj.username}})


        # If there's an odd participant, they stay in the waitlist
        self.op_lock = False
        self.save()
