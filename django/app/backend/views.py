import datetime
import json


from django.utils import timezone
from django.http import HttpResponse, HttpResponseForbidden, HttpResponseBadRequest, JsonResponse
from django.views import View

from .enums import AuthLevel, TokenValidationResponse
from .models import User

from rest_framework import generics, permissions
from rest_framework.response import Response
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


class AddFriendView(View):
    def post(self, request):
        try:
            # On essaie de charger les données JSON de la requête
            data = json.loads(request.body)
            friend_username = data.get('friend_username')
            
            # Si le nom d'utilisateur de l'ami n'est pas fourni, on retourne une erreur
            if not friend_username:
                return JsonResponse({'status': 'error', 'message': 'Missing friend username'}, status=400)
            
            try:
                user = User.objects.get(id=1)  # Utilisateur fixe pour les tests
                # On essaie de récupérer l'utilisateur correspondant au nom d'utilisateur fourni
                friend = User.objects.get(username=friend_username)
                
                # Vérification pour éviter que l'utilisateur ne s'ajoute lui-même comme ami
                if user == friend:
                    return JsonResponse({'status': 'error', 'message': 'Cannot add yourself as a friend'}, status=400)
                
                # Vérification pour voir si l'utilisateur est déjà ami avec cette personne
                if friend in user.friends.all():
                    return JsonResponse({'status': 'error', 'message': 'Already friends'}, status=400)
                
                # Si toutes les vérifications sont passées, on ajoute l'ami
                user.friends.add(friend)
                return JsonResponse({
                    'status': 'success',
                    'message': f'Friend {friend_username} added successfully',
                    'friend': {
                        'username': friend.username,
                        'status': 'Offline',  # mettre en place une logic pour le statut
                        'profile_picture': friend.profile_picture.url if hasattr(friend, 'profile_picture') else None
                    }
                })
            except User.DoesNotExist:
                return JsonResponse({'status': 'error', 'message': 'User not found'}, status=404)
        except json.JSONDecodeError:
            return JsonResponse({'status': 'error', 'message': 'Invalid JSON'}, status=400)


# class GetFriendsView(View):
#    def get(self, request):
#         try:
#             user = User.objects.get(id=1)  # Utilisateur fixe pour les tests, à remplacer par l'utilisateur authentifié
#             friends = user.friends.all()
#             friends_data = [
#                 {
#                     'username': friend.username,
#                     'status': 'Offline',  # Adapter la logique de statut
#                     'profile_picture': friend.profile_picture.url if hasattr(friend, 'profile_picture') else None
#                 }
#                 for friend in friends
#             ]
#             return JsonResponse({'status': 'success', 'friends': friends_data})
#         except User.DoesNotExist:
#             return JsonResponse({'status': 'error', 'message': 'User not found'}, status=404)
