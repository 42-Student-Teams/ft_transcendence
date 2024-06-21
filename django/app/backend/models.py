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
