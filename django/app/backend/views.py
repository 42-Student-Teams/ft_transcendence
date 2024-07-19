import datetime
import json
import os

from django.conf import settings
from django.utils import timezone
from django.http import HttpResponse, HttpResponseForbidden, HttpResponseBadRequest
from rest_framework.exceptions import AuthenticationFailed
from rest_framework.views import APIView

from .enums import AuthLevel, TokenValidationResponse
from .models import User, JwtUser

from rest_framework import status
from rest_framework.response import Response
from .serializers import JwtUserSerializer

import jwt

from .util import timestamp_now, date_to_timestamp, get_user_info


def index(request):
    return HttpResponse(f"Hello Transcendence, this route is deprecated")

def create_user(request):
    return HttpResponse(f"Hello Transcendence, this route is deprecated")

class UserCreateView(APIView):
    def post(self, request):
        print('--------------------')
        print(request.data)
        print('--------------------')
        serializer = JwtUserSerializer(data=request.data)
        serializer.is_valid(raise_exception=True)
        user = serializer.save()
        return Response(data=serializer.data, status=status.HTTP_201_CREATED)

class UserOauthLoginView(APIView):
    def post(self, request):
        print('LOOOOOL')
        oauth_token = None
        username = None
        if 'oauth_token' in request.data:
            oauth_token = request.data['oauth_token']
        if oauth_token is not None:
            user_info = get_user_info(oauth_token)
            if user_info is not None:
                username = user_info['login']
            else:
                raise AuthenticationFailed()
        else:
            raise AuthenticationFailed()

        payload = {
            'username': username,
            'expires': date_to_timestamp(datetime.datetime.now(datetime.timezone.utc) + datetime.timedelta(
                minutes=settings.TOKEN_EXPIRATION_MINUTES)),
            'iat': timestamp_now(),
        }
        token = jwt.encode(payload, os.getenv('JWT_SECRET'), algorithm='HS256')
        res = Response()
        res.data = {
            'jwt': token,
        }

        user: JwtUser = JwtUser.objects.filter(username=username).first()
        if user is None:
            #raise AuthenticationFailed('Incorrect username or password')
            new_user = JwtUser.objects.create()
            new_user.username = username
            new_user.set_unusable_password()
            new_user.isoauth = True
            new_user.save()
            return res
        else:
            if user.isoauth:
                return res
            else:
                raise AuthenticationFailed("Non-oauth user already registered with this username")

class UserLoginView(APIView):
    def post(self, request):
        username, password = None, None
        if 'username' in request.data:
            username = request.data['username']
        if 'password' in request.data:
            password = request.data['password']

        user: JwtUser = JwtUser.objects.filter(username=username).first()
        if user is None:
            raise AuthenticationFailed('Incorrect username or password')
        if not user.check_password(password):
            raise AuthenticationFailed('Incorrect username or password')

        # https://github.com/jpadilla/pyjwt/issues/407
        payload = {
            'username': user.username,
            'expires': date_to_timestamp(datetime.datetime.now(datetime.timezone.utc) + datetime.timedelta(minutes=settings.TOKEN_EXPIRATION_MINUTES)),
            'iat': timestamp_now(),
        }

        token = jwt.encode(payload, os.getenv('JWT_SECRET'), algorithm='HS256') #.decode('utf-8')
        print(f'generated token: {token}')

        res = Response()
        res.data = {
            'jwt': token,
        }

        return res

class UserListView(APIView):
    def get(self, request):
        token = request.GET.get('jwt')
        if token is None:
            raise AuthenticationFailed('Unauthenticated')
        try:
            payload = jwt.decode(token, os.getenv('JWT_SECRET'), algorithm=['HS256'])
        except jwt.ExpiredSignatureError:
            raise AuthenticationFailed('Unauthenticated')

        user = JwtUser.objects.get(username=payload['username'])

        return ({'status': 'success'})

class UserExistsView(APIView):
    def get(self, request):
        username = request.data['username']
        user = JwtUser.objects.filter(username=username).first()
        if user is None:
            return ({'status': False})
        else:
            return {'status': True}

class UserIsOauth(APIView):
    def get(self, request):
        username = request.data['username']
        user = JwtUser.objects.filter(username=username).first()
        if user is None:
            return {'status': False}
        elif user.isoauth:
            return {'status': True}
        else:
            return {'status': False}
