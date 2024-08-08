from django.utils import timezone
import secrets

from django.conf import settings
from django.contrib.auth.models import AbstractUser
from django.db import models
from django.db.models import Q
from django.utils.translation import gettext_lazy as _

from argon2 import PasswordHasher
from argon2.exceptions import VerifyMismatchError

from .managers import CustomUserManager
from .util import timestamp_now


class User(models.Model):
    objects = CustomUserManager()

    username = models.TextField(unique=True)
    pwd_hash = models.TextField(blank=True, null=True)
    pwd_salt = models.TextField(blank=True, null=True)
    session_token = models.TextField(blank=True, null=True)
    session_token_expires = models.DateTimeField(blank=True, null=True)
    oauth_token = models.DateTimeField(blank=True, null=True)
    is_admin = models.BooleanField(default=False)
    friends = models.ManyToManyField('self', symmetrical=False, blank=True, related_name='user_friends')

    def validate_password(self, password):
        ph = PasswordHasher()
        try:
            ph.verify(self.pwd_hash, password)
        except VerifyMismatchError as e:
            return False
        return True

    def refresh_session_token(self):
        self.session_token = secrets.token_urlsafe()
        dt = timezone.localtime()
        print("timenow:")
        print(dt.strftime("%H:%M:%S / %d-%m-%Y"))
        td = timezone.timedelta(minutes=settings.TOKEN_EXPIRATION_MINUTES)
        expiration_date = dt + td
        self.session_token_expires = expiration_date
        print("new expiration:")
        print(self.session_token_expires.strftime("%H:%M:%S / %d-%m-%Y"))
        self.save()

    def __str__(self):
        return self.username

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
    avatar = models.ImageField(max_length=200, default="default_avatar.png", upload_to='avatars')
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
    joueur1 = models.ForeignKey(JwtUser, on_delete=models.CASCADE, related_name='parties_joueur1')
    joueur2 = models.ForeignKey(JwtUser, on_delete=models.CASCADE, related_name='parties_joueur2')
    duree_partie = models.IntegerField()
    score_joueur1 = models.IntegerField()
    score_joueur2 = models.IntegerField()
    gagnant = models.ForeignKey(JwtUser, on_delete=models.CASCADE, related_name='parties_gagnees', null=True, blank=True)

    def save(self, *args, **kwargs):
        # Détermination du gagnant avant la sauvegarde
        if self.score_joueur1 > self.score_joueur2:
            self.gagnant = self.joueur1
        elif self.score_joueur2 > self.score_joueur1:
            self.gagnant = self.joueur2
        super().save(*args, **kwargs)

    @classmethod
    def enregistrer_partie(cls, joueur1, joueur2, duree_partie, score_joueur1, score_joueur2):
        partie = cls(
            joueur1=joueur1,
            joueur2=joueur2,
            duree_partie=duree_partie,
            score_joueur1=score_joueur1,
            score_joueur2=score_joueur2
        )
        partie.save()
        return partie

    def __str__(self):
        return f"Partie entre {self.joueur1.username} et {self.joueur2.username} le {self.date_partie}"


class MatchRequest(models.Model):
    request_author = models.ForeignKey(User, related_name='author', on_delete=models.CASCADE)
    target_user = models.ForeignKey(User, related_name='target', on_delete=models.SET_NULL, null=True,
                                    blank=True)
    ball_color = models.CharField(max_length=50)
    created_at = models.FloatField()

    def __str__(self):
        return f"{self.request_author} vs {self.target_user if self.target_user else 'Anyone'}"

    @staticmethod
    def request_match(request_author, target_user, ball_color):
        MatchRequest.objects.filter(request_author=request_author).delete()
        match_request = MatchRequest(
            request_author=request_author,
            target_user=target_user,
            ball_color=ball_color,
            created_at=timestamp_now()
        )
        match_request.save()
        return match_request
