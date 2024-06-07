from django.shortcuts import render
from django.http import HttpResponse

from .models import User

def index(request):
    return HttpResponse(f"Hello Transcendence {User.objects.filter(id=1).get().username}")

def create_user(request):
    user = User()
    user.username = "lol"
    user.pwd_salt = "lol"
    user.pwd_hash = "lol"
    user.save()
    return HttpResponse(f"Hello Transcendence {len(User.objects.all())}")