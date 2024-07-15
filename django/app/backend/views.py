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

from rest_framework import, status
from rest_framework.response import Response
from .serializers import JwtUserSerializer

import jwt

def jsonget(request, key):
    try:
        data = json.loads(request.body)
    except:
        return None
    if key not in data:
        return None
    return data[key]


def validate_token(request, auth_level: AuthLevel) -> TokenValidationResponse:
    token = jsonget(request, 'token')
    if token is None:
        token = request.GET.get('token')
    print(f'token: {token}, auth_level: {auth_level}')
    if auth_level.value > AuthLevel.NOAUTH.value:
        requesting_user: User = User.objects.user_by_token(token)
        if requesting_user is None:
            return TokenValidationResponse.INVALID
        if auth_level == AuthLevel.ADMIN:
            if not requesting_user.is_admin:
                return TokenValidationResponse.MISSING_PERMS
        time_now = timezone.localtime()
        print(time_now.strftime("%Y-%m-%d-%H-%M-%S"))
        print(requesting_user.session_token_expires.strftime("%Y-%m-%d-%H-%M-%S"))
        if requesting_user.session_token_expires < time_now:
            return TokenValidationResponse.EXPIRED
    return TokenValidationResponse.VALID


def respond_invalid_token(reason: TokenValidationResponse):
    match reason.value:
        case TokenValidationResponse.MISSING_PERMS.value:
            return HttpResponseForbidden('{"reason":"missing permissions"}', content_type='application/json')
        case TokenValidationResponse.INVALID.value:
            return HttpResponseForbidden('{"reason":"invalid token"}', content_type='application/json')
        case TokenValidationResponse.EXPIRED.value:
            return HttpResponseForbidden('{"reason":"expired token"}', content_type='application/json')
    return HttpResponseForbidden('{"reason":"unknown error"}', content_type='application/json')


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

class UserLoginView(APIView):
    def post(self, request):
        username = request.data['username']
        password = request.data['password']

        user: JwtUser = JwtUser.objects.filter(username=username).first()
        if user is None:
            raise AuthenticationFailed('User not found')
        if not user.can_login(password):
            raise AuthenticationFailed('Incorrect username or password')

        payload = {
            'username': user.username,
            'expires': datetime.datetime.utcnow() + datetime.timedelta(minutes=settings.TOKEN_EXPIRATION_MINUTES),
            'iat': datetime.datetime.utcnow(),
        }

        token = jwt.encode(payload, os.getenv('JWT_SECRET'), algorithm='HS256').decode('utf-8')

        res = Response()
        res.data = {
            'jwt': token,
        }

        return Response({'jwt': token})

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
            return ({'status': True})

class UserIsOauth(APIView):
    def get(self, request):
        username = request.data['username']
        user = JwtUser.objects.filter(username=username).first()
        if user is None:
            return ({'status': False})
        elif user.isoauth:
            return ({'status': True})
        else:
            return ({'status': False})
