from datetime import datetime, timedelta
import secrets

from argon2 import PasswordHasher

from django.conf import settings
from django.utils.translation import gettext_lazy as _
from django.db import models


class CustomUserManager(models.Manager):
    def create_user(self, username, password=None, oauth_token=None, is_admin=False, **extra_fields):
        if not username:
            raise ValueError(_('The username must be set'))
        user = self.model(username=username, is_admin=is_admin, **extra_fields)
        if password is not None:
            ph = PasswordHasher()
            hash = ph.hash(password)
            user.pwd_hash = hash
        else:
            # store oauth token or whatever is needed here
            pass

        user.session_token = secrets.token_urlsafe()
        dt = datetime.now()
        td = timedelta(minutes=settings.TOKEN_EXPIRATION_MINUTES)
        # your calculated date
        expiration_date = dt + td
        user.session_token_expires = expiration_date
        user.save()
        return user

    def create_superuser(self, username, password=None, oauth_token=None, **extra_fields):
        return self.create_user(username=username, password=password, oauth_token=oauth_token, is_admin=True, **extra_fields)

    def user_by_username(self, username):
        users = self.filter(username=username)
        if len(users) == 0:
            return None
        return users.first()

    def user_by_token(self, token):
        users = self.filter(session_token=token)
        if len(users) == 0:
            return None
        return users.first()
