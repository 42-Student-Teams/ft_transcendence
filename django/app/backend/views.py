from django.shortcuts import render
from django.http import HttpResponse

from .models import User

from rest_framework import generics, permissions
from .serializers import UserSerializer

def index(request):
    return HttpResponse(f"Hello Transcendence {User.objects.filter(id=1).get().username}")

def create_user(request):
    user = User()
    user.username = "lol"
    user.pwd_salt = "lol"
    user.pwd_hash = "lol"
    user.save()
    return HttpResponse(f"Hello Transcendence {len(User.objects.all())}")

class UserCreateView(generics.CreateAPIView):
    queryset = User.objects.all()
    serializer_class = UserSerializer
    permission_classes = [permissions.IsAuthenticated]
    http_method_names = ['post']

class UserListView(generics.ListAPIView):
    queryset = User.objects.all()
    serializer_class = UserSerializer
    http_method_names = ['get']