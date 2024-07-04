import datetime
import json
import os
import requests

from django.utils import timezone
from django.http import HttpResponse, HttpResponseForbidden, HttpResponseBadRequest, HttpResponseRedirect
from django.views import View
from django.shortcuts import redirect
from django.contrib.auth import login, logout


from .enums import AuthLevel, TokenValidationResponse
from .models import User

from rest_framework import generics, permissions
from rest_framework.response import Response
from rest_framework.views import APIView
from .serializers import UserSerializer




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


class UserCreateView(View):
    http_method_names = ['post']
    auth_level: AuthLevel = AuthLevel.NOAUTH

    def post(self, request, *args, **kwargs):
        if validate_token(request, self.auth_level) != TokenValidationResponse.VALID:
            return respond_invalid_token(validate_token(request, self.auth_level))

        err_resp = {'reason': 'unknown'}
        if jsonget(request, 'username') is None:
            err_resp['reason'] = 'missing username'
            return HttpResponseBadRequest(json.dumps(err_resp), content_type='application/json')
        if jsonget(request, 'password') is None and jsonget(request, 'oauth_token') is None:
            err_resp['reason'] = 'missing password or oauth token'
            return HttpResponseBadRequest(json.dumps(err_resp), content_type='application/json')
        if jsonget(request, 'password') is not None and jsonget(request, 'oauth_token') is not None:
            err_resp['reason'] = 'need only password or oauth token'
            return HttpResponseBadRequest(json.dumps(err_resp), content_type='application/json')

        if User.objects.user_by_username(jsonget(request, 'username')) is not None:
            err_resp['reason'] = 'duplicate username'
            return HttpResponseBadRequest(
                json.dumps(err_resp, default=str),
                content_type='application/json')
        new_user = User.objects.create_user(username=jsonget(request, 'username'),
                                            password=jsonget(request, 'password'),
                                            oauth_token=jsonget(request, 'oauth_token'))
        return HttpResponse(
            json.dumps({'token': new_user.session_token, 'expires': new_user.session_token_expires}, default=str),
            content_type='application/json')


class UserLoginView(View):
    http_method_names = ['post']
    auth_level: AuthLevel = AuthLevel.NOAUTH

    def post(self, request, *args, **kwargs):
        if validate_token(request, self.auth_level) != TokenValidationResponse.VALID:
            return respond_invalid_token(validate_token(request, self.auth_level))

        err_resp = {'reason': 'unknown'}
        if jsonget(request, 'username') is None:
            err_resp['reason'] = 'missing username'
            return HttpResponseBadRequest(json.dumps(err_resp), content_type='application/json')
        if jsonget(request, 'password') is None:
            err_resp['reason'] = 'missing password'
            return HttpResponseBadRequest(json.dumps(err_resp), content_type='application/json')

        user: User = User.objects.user_by_username(jsonget(request, 'username'))
        if user is None:
            err_resp['reason'] = 'user not found'
            return HttpResponseBadRequest(
                json.dumps(err_resp, default=str),
                content_type='application/json')
        if not user.validate_password(jsonget(request, 'password')):
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
    auth_level = AuthLevel.AUTH

    def get(self, request, *args, **kwargs):
        if validate_token(request, self.auth_level) != TokenValidationResponse.VALID:
            return respond_invalid_token(validate_token(request, self.auth_level))

        # Proceed with normal view logic if the parameter is present
        queryset = self.get_queryset()
        serializer = self.get_serializer(queryset, many=True)
        return Response(serializer.data)

#42Oauth-------------------------------------------------------------------------------------****

# LoginAPIView : Pour initier le processus de connexion.
class LoginAPIView(APIView):
    def get(self, request):
        main_url = os.getenv('WEBSITE_URL')
        if request.user.is_authenticated:
            return redirect(main_url)

        client_id = os.getenv('CLIENT_ID')
        redirect_uri = os.getenv('REDIRECT_URI')

        if not client_id or not redirect_uri:
            return redirect(main_url)

        login_url = f"https://api.intra.42.fr/oauth/authorize?client_id={client_id}&redirect_uri={redirect_uri}&response_type=code"
        return redirect(login_url)
    
#OAuthCallbackAPIView :-------------------------------------------------------------------------------------****
#Pour gérer le callback après l'autorisation.
class OAuthCallbackAPIView(APIView):
    def get(self, request):
        main_url = os.getenv('WEBSITE_URL')
        if request.user.is_authenticated:
            return HttpResponseRedirect(main_url)

        code = request.GET.get("code")
        error = request.GET.get("error")
        if error:
            return HttpResponseRedirect(main_url)

        access_token = self.get_access_token_data(code)
        if 'error' in access_token or 'access_token' not in access_token:
            return HttpResponseRedirect(main_url)

        user_info = self.get_user_info(access_token['access_token'])
        if 'error' in user_info:
            return HttpResponseRedirect(main_url)

        user = self.get_or_create_user(user_info)
        login(request, user)
        return HttpResponseRedirect(main_url)

    def get_access_token_data(self, code):
        data = {
            "grant_type": "authorization_code",
            "client_id": os.getenv("CLIENT_ID"),
            "client_secret": os.getenv("CLIENT_SECRET"),
            "code": code,
            "redirect_uri": os.getenv("REDIRECT_URI"),
            "scope": "public"
        }
        try:
            response = requests.post('https://api.intra.42.fr/oauth/token', data=data)
            response.raise_for_status()
            return response.json()
        except requests.RequestException as e:
            return {"error": str(e)}

    def get_user_info(self, access_token):
        try:
            response = requests.get('https://api.intra.42.fr/v2/me',
                                    headers={'Authorization': f'Bearer {access_token}'})
            response.raise_for_status()
            return response.json()
        except requests.RequestException as e:
            return {"error": str(e)}

    def get_or_create_user(self, user_info):
        login = user_info.get('login')
        email = user_info.get('email')
        user, created = User.objects.get_or_create(
        oauth_id=login,
        defaults={'username': login, 'email': email}
    )
        if not created:
        # Mettre à jour les informations de l'utilisateur existant si nécessaire
            user.email = email
            user.save()
    
        return user

# LogOutAPIView :-------------------------------------------------------------------------------------****
# Pour gérer la déconnexion.
# class LogOutAPIView(APIView):
#     def get(self, request):
#         if request.user.is_authenticated:
#             logout(request)
#         main_url = os.getenv('WEBSITE_URL')
#         return redirect(main_url)