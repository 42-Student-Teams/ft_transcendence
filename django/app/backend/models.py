#from _datetime import datetime, timedelta
from django.utils import timezone
import secrets

from django.conf import settings
from django.contrib.auth.models import AbstractUser
from django.db import models
from django.utils.translation import gettext_lazy as _

from argon2 import PasswordHasher
from argon2.exceptions import VerifyMismatchError

from .managers import CustomUserManager

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
        # x = timezone.localtime()
        # print(x.strftime("%H:%M:%S / %d-%m-%Y"))
        print("timezone local")

        td = timezone.timedelta(minutes=settings.TOKEN_EXPIRATION_MINUTES)
        # your calculated date
        expiration_date = dt + td
        self.session_token_expires = expiration_date
        print("new expiration:")
        print(self.session_token_expires.strftime("%H:%M:%S / %d-%m-%Y"))
        self.save()

    def __str__(self):
        return self.username

class JwtUser(AbstractUser):
    #name = models.CharField(max_length=255)
    #email = models.CharField(max_length=255, unique=True)
    username = models.CharField(unique=True, max_length=255)
    email = None
    password = models.CharField(max_length=255)
    isoauth = models.BooleanField(default=False)
    friends = models.ManyToManyField('self', symmetrical=False, blank=True, related_name='user_friends')
    friend_requests = models.ManyToManyField('self', symmetrical=False, blank=True, related_name='pending_friend_requests')
    blocked_users = models.ManyToManyField('self', symmetrical=False, blank=True, related_name='blocked_by')
    avatar = models.ImageField(max_length=200, default="default_avatar.png", upload_to='avatars') # setup to load the image, need the field and the img

    USERNAME_FIELD = 'username'
    REQUIRED_FIELDS = []
