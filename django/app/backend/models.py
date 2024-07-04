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
    oauth_token = models.TextField(blank=True, null=True)
    oauth_id = models.TextField(blank=True, null=True, unique=True)
    is_admin = models.BooleanField(default=False)
   

    def validate_password(self, password):
        ph = PasswordHasher()
        try:
            ph.verify(self.pwd_hash, password)
        except VerifyMismatchError as e:
            return False
        return True

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
    oauth_token = models.TextField(blank=True, null=True)
    oauth_id = models.TextField(blank=True, null=True, unique=True)
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
        print(f"Current time: {dt.strftime('%Y-%m-%d %H:%M:%S')}")
    
        expiration_minutes = settings.TOKEN_EXPIRATION_MINUTES
        td = timezone.timedelta(minutes=expiration_minutes)
        expiration_date = dt + td
        self.session_token_expires = expiration_date
    
        print(f"Token expiration: {self.session_token_expires.strftime('%Y-%m-%d %H:%M:%S')}")
        print(f"Token will expire in {expiration_minutes} minutes")
    
        self.save(update_fields=['session_token', 'session_token_expires'])

    def __str__(self):
        return self.username


    def __str__(self):
        return self.username
