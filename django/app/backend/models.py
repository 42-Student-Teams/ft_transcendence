from django.db import models

class User(models.Model):
    username = models.TextField()
    pwd_hash = models.TextField()
    pwd_salt = models.TextField()

    def __str__(self):
        return self.username