from django.utils import timezone
from django.contrib.auth.models import AbstractUser
from django.db import models
from django.db.models import Q

from .util import timestamp_now, random_alphanum, AnonClass


class JwtUser(AbstractUser):
    first_name = models.CharField(max_length=255)
    last_name = models.CharField(max_length=255)
    username = models.CharField(unique=True, max_length=255)
    email = None
    password = models.CharField(max_length=255)
    isoauth = models.BooleanField(default=False)
    friends = models.ManyToManyField('self', symmetrical=False, blank=True, related_name='user_friends')
    friend_requests = models.ManyToManyField('self', symmetrical=False, blank=True, related_name='pending_friend_requests')
    blocked_users = models.ManyToManyField('self', symmetrical=False, blank=True, related_name='blocked_by')
    avatar = models.ImageField(max_length=200, default="staticfiles/avatars/default_avatar.png", upload_to='staticfiles/avatars/')
    status = models.CharField(max_length=20, default='Offline')

    USERNAME_FIELD = 'username'
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
            match_key=acknowledgement.match_key
        )


class GameSearchQueue(models.Model):
    user = models.OneToOneField(JwtUser, on_delete=models.CASCADE, related_name='search_queue')

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
