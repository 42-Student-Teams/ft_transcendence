import datetime
import json
import requests

from django.utils import timezone
from django.http import HttpResponse, HttpResponseForbidden, HttpResponseBadRequest, JsonResponse
from django.views import View
from django.shortcuts import render, redirect
from django.conf import settings
from requests import get, post  # ou toute autre fonction dont vous avez besoin


from .enums import AuthLevel, TokenValidationResponse
from .models import User

from rest_framework import generics, permissions
from rest_framework.response import Response
from .serializers import UserSerializer

from django.views.decorators.csrf import csrf_exempt
from social_django.utils import psa


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


def oauth_callback(request):
    code = request.GET.get('code')
    if not code:
        print("Pas de code reçu dans la requête")
        return HttpResponse("Erreur : Pas de code reçu", status=400)

    print(f"Code reçu : {code}")

    token_url = 'https://api.intra.42.fr/oauth/token'
    data = {
        'grant_type': 'authorization_code',
        'client_id': settings.SOCIAL_AUTH_42_KEY,
        'client_secret': settings.SOCIAL_AUTH_42_SECRET,
        'code': code,
        'redirect_uri': settings.SOCIAL_AUTH_42_REDIRECT_URI
    }
    
    print(f"Envoi de la requête pour obtenir le token. URL : {token_url}, Data : {data}")
    
    response = requests.post(token_url, data=data)
    
    print(f"Réponse de la requête token. Status : {response.status_code}, Contenu : {response.text}")

    if response.status_code != 200:
        error_message = f"Erreur lors de l'échange du code contre un token: {response.text}"
        print(error_message)
        return HttpResponse(error_message, status=400)

    token_data = response.json()
    access_token = token_data.get('access_token')
        
    if not access_token:
        print("Pas de access_token dans la réponse")
        return HttpResponse("Erreur : Pas de access_token reçu", status=400)

    user_info = get_user_info(access_token)
        
    if user_info:
        oauth_id = str(user_info.get('id'))
        username = user_info.get('login')
            
        if not oauth_id or not username:
            print(f"Informations utilisateur incomplètes. oauth_id: {oauth_id}, username: {username}")
            return HttpResponse("Erreur : Informations utilisateur incomplètes", status=400)
            
        try:
            user, created = User.objects.get_or_create(
                oauth_id=oauth_id,
                defaults={'username': username}
            )
                
            # Mettre à jour le token OAuth séparément
            user.oauth_token = access_token
            user.save(update_fields=['oauth_token'])
                
            print(f"Utilisateur {'créé' if created else 'mis à jour'}: {username}")
                
            # Générer un token de session
            user.refresh_session_token()
                
            # Renvoyer le token au frontend
            return JsonResponse({
                'token': user.session_token,
                # 'expires': user.session_token_expires.isoformat() if user.session_token_expires else None,
                'username': user.username
            })
        except Exception as e:
            print(f"Erreur lors de la création/mise à jour de l'utilisateur: {str(e)}")
            return HttpResponse("Erreur interne du serveur", status=500)
    else:
        return HttpResponse("Erreur lors de la récupération des informations utilisateur", status=400)


def get_user_info(access_token):
    user_info_url = 'https://api.intra.42.fr/v2/me'
    headers = {'Authorization': f'Bearer {access_token}'}
    
    print(f"Envoi de la requête pour obtenir les infos utilisateur. URL : {user_info_url}")
    
    response = requests.get(user_info_url, headers=headers)
    
    print(f"Réponse de la requête user_info. Status : {response.status_code}, Contenu : {response.text}")

    if response.status_code == 200:
        return response.json()
    else:
        print(f"Erreur lors de la récupération des informations utilisateur: {response.text}")
        return None

def get_oauth_config(request):
    response = JsonResponse({
        'CLIENT_ID': settings.SOCIAL_AUTH_42_KEY,
        'REDIRECT_URI': settings.SOCIAL_AUTH_42_REDIRECT_URI,
        'AUTHORIZATION_URL': settings.SOCIAL_AUTHORIZATION_URL,
    })
    response["Access-Control-Allow-Origin"] = "http://localhost:8080"
    response["Access-Control-Allow-Credentials"] = "true"
    return response

def make_api_request(access_token, endpoint):
    base_url = 'https://api.intra.42.fr/v2'
    headers = {'Authorization': f'Bearer {access_token}'}
    
    response = requests.get(f"{base_url}/{endpoint}", headers=headers)
    
    if response.status_code == 200:
        return response.json()
    else:
        return None