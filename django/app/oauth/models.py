from django.db import models

class User(models.Model):
    username = models.CharField(max_length=100, unique=True)
    access_token = models.CharField(max_length=255)

