# from django.db import models
# from django.utils import timezone
# import secrets
# from django.conf import settings
# from argon2 import PasswordHasher
# from argon2.exceptions import VerifyMismatchError

# from backend.models import User  # Assurez-vous d'importer le modèle User du backend

# class CustomUser(User):  # Inhérente du modèle User du backend
#     class Meta:
#         db_table = 'backend_user'

from django.db import models
from django.conf import settings
from django.utils import timezone
from argon2 import PasswordHasher, exceptions as argon2_exceptions
import secrets

class CustomUser(models.Model):
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
        except argon2_exceptions.VerifyMismatchError:
            return False
        return True

    def refresh_session_token(self):
        self.session_token = secrets.token_urlsafe()
        self.session_token_expires = timezone.now() + timezone.timedelta(minutes=settings.TOKEN_EXPIRATION_MINUTES)
        self.save()

    def __str__(self):
        return self.username

class Message(models.Model):
    user = models.ForeignKey(CustomUser, on_delete=models.CASCADE)
    content = models.TextField()
    timestamp = models.DateTimeField(auto_now_add=True)

    def __str__(self):
        return f"{self.user.username}: {self.content[:20]}"
