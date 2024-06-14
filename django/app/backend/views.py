import datetime
import json

from django.http import HttpResponse, HttpResponseForbidden, HttpResponseBadRequest
from django.views import View

from .enums import AuthLevel, TokenValidationResponse
from .models import User

from rest_framework import generics, permissions
from rest_framework.response import Response
from .serializers import UserSerializer


def validate_token(requestget, auth_level: AuthLevel) -> TokenValidationResponse:
    token = requestget.get('token')
    print(f'token: {token}, auth_level: {auth_level}')
    if auth_level.value > AuthLevel.NOAUTH.value:
        print('bruh')
        #if len(User.objects.filter(session_token=token)) == 0:
        #    print('bruh2')
        #    return TokenValidationResponse.INVALID
        requesting_user: User = User.objects.user_by_token(token)  #User.objects.filter(session_token=token).first()
        if requesting_user is None:
            return TokenValidationResponse.INVALID
        if auth_level == AuthLevel.ADMIN:
            if not requesting_user.is_admin:
                return TokenValidationResponse.MISSING_PERMS
        if requesting_user.session_token_expires < datetime.datetime.now():
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


class UserCreateView(View):
    http_method_names = ['post']
    auth_level: AuthLevel = AuthLevel.NOAUTH

    def post(self, request, *args, **kwargs):
        if validate_token(request.POST, self.auth_level) != TokenValidationResponse.VALID:
            return respond_invalid_token(validate_token(request.POST, self.auth_level))

        err_resp = {'reason': 'unknown'}
        if not request.POST.get('username'):
            err_resp['reason'] = 'missing username'
            return HttpResponseBadRequest(json.dumps(err_resp), content_type='application/json')
        if not request.POST.get('password') and not request.POST.get('oauth_token'):
            err_resp['reason'] = 'missing password or oauth token'
            return HttpResponseBadRequest(json.dumps(err_resp), content_type='application/json')
        if request.POST.get('password') and request.POST.get('oauth_token'):
            err_resp['reason'] = 'need only password or oauth token'
            return HttpResponseBadRequest(json.dumps(err_resp), content_type='application/json')

        if User.objects.user_by_username(request.POST.get('username')) is not None:
            err_resp['reason'] = 'duplicate username'
            return HttpResponseBadRequest(
                json.dumps(err_resp, default=str),
                content_type='application/json')
        new_user = User.objects.create_user(username=request.POST.get('username'),
                                            password=request.POST.get('password'),
                                            oauth_token=request.POST.get('oauth_token'))
        return HttpResponse(
            json.dumps({'token': new_user.session_token, 'expires': new_user.session_token_expires}, default=str),
            content_type='application/json')


class UserLoginView(View):
    http_method_names = ['post']
    auth_level: AuthLevel = AuthLevel.NOAUTH

    def post(self, request, *args, **kwargs):
        print('bruhhhhhhhhhhhh1')
        print(request.body)
        data = json.loads(request.body)

        if validate_token(request.POST, self.auth_level) != TokenValidationResponse.VALID:
            return respond_invalid_token(validate_token(request.POST, self.auth_level))

        err_resp = {'reason': 'unknown'}
        if 'username' not in data:
            err_resp['reason'] = 'missing username'
            return HttpResponseBadRequest(json.dumps(err_resp), content_type='application/json')
        if 'password' not in data:
            err_resp['reason'] = 'missing password'
            return HttpResponseBadRequest(json.dumps(err_resp), content_type='application/json')

        user: User = User.objects.user_by_username(data['username'])
        if user is None:
            err_resp['reason'] = 'user not found'
            return HttpResponseBadRequest(
                json.dumps(err_resp, default=str),
                content_type='application/json')
        if not user.validate_password(data['password']):
            err_resp['reason'] = 'invalid password'
            return HttpResponseForbidden(
                json.dumps(err_resp, default=str),
                content_type='application/json')

        user.refresh_session_token()
        return HttpResponse(
            json.dumps({'token': user.session_token, 'expires': user.session_token_expires}, default=str),
            content_type='application/json')


class UserListView(generics.ListAPIView):
    queryset = User.objects.all()
    serializer_class = UserSerializer
    http_method_names = ['get']
    auth_level = AuthLevel.NOAUTH

    def get(self, request, *args, **kwargs):
        if validate_token(request.GET, self.auth_level) != TokenValidationResponse.VALID:
            return respond_invalid_token(validate_token(request.GET, self.auth_level))

        # Proceed with normal view logic if the parameter is present
        queryset = self.get_queryset()
        serializer = self.get_serializer(queryset, many=True)
        return Response(serializer.data)
