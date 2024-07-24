import datetime
import json
import os
import jwt

from django.conf import settings
from django.utils import timezone
from django.http import HttpResponse, HttpResponseForbidden, HttpResponseBadRequest, JsonResponse
from rest_framework.exceptions import AuthenticationFailed
from rest_framework.views import APIView

from .enums import AuthLevel, TokenValidationResponse
from .models import User, JwtUser

from rest_framework import status
from rest_framework.response import Response
from .serializers import JwtUserSerializer

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

##----------------------------------FRIEND-BLOCK-PENDING-LIST------------------------------###       


##--------------------------------------FRIEND-REQUEST-----------------------------------------### 
# 1.Vérification de l'authentification : Vérifie et décode le jeton JWT de l'en-tête d'autorisation.
# 2.Validation de l'utilisateur : Vérifie que l'utilisateur extrait du jeton existe dans la base de données.
# 3.Validation du nom d'utilisateur de l'ami : Vérifie la présence du nom d'utilisateur de l'ami dans la requête.
# 4.Ajout de l'ami : Vérifie que l'utilisateur n'ajoute pas lui-même et qu'ils ne sont pas déjà amis, puis ajoute l'ami.
# 5.Retour de la réponse : Retourne une réponse de succès ou d'erreur selon les résultats des vérifications.
class FriendView(APIView):
    def post(self, request):
        auth_header = request.headers.get('Authorization')
        if not auth_header:
            raise AuthenticationFailed('Unauthenticated')
        
        try:
            token = auth_header.split()[1]
            payload = jwt.decode(token, settings.JWT_SECRET, algorithms=['HS256'])
        except jwt.ExpiredSignatureError:
            raise AuthenticationFailed('Token expired')
        except (IndexError, jwt.DecodeError):
            raise AuthenticationFailed('Invalid token')

        try:
            user = JwtUser.objects.get(username=payload['username'])
        except JwtUser.DoesNotExist:
            raise AuthenticationFailed('User not found')

        friend_username = request.data.get('friend_username')
        if not friend_username:
            return Response({'status': 'error', 'message': 'Missing friend username'}, status=status.HTTP_400_BAD_REQUEST)

        try:
            friend = JwtUser.objects.get(username=friend_username)
            if user == friend:
                return Response({'status': 'error', 'message': 'Cannot add yourself as a friend'}, status=status.HTTP_400_BAD_REQUEST)
            if friend in user.friends.all():
                return Response({'status': 'error', 'message': 'Already friends'}, status=status.HTTP_400_BAD_REQUEST)
            
            user.friends.add(friend)
            return Response({
                'status': 'success',
                'message': f'Friend {friend_username} added successfully',
                'friend': {
                    'username': friend.username,
                    'status': 'Offline',
                    'profile_picture': friend.profile_picture.url if hasattr(friend, 'profile_picture') else None
                }
            }, status=status.HTTP_200_OK)
        except JwtUser.DoesNotExist:
            return Response({'status': 'error', 'message': 'User not found'}, status=status.HTTP_404_NOT_FOUND)


class AcceptFriendRequestView(APIView):
    def post(self, request):
        token = request.data.get('jwt')
        if token is None:
            raise AuthenticationFailed('Unauthenticated')
        
        try:
            payload = jwt.decode(token, settings.JWT_SECRET, algorithms=['HS256'])
        except jwt.ExpiredSignatureError:
            raise AuthenticationFailed('Unauthenticated')

        user = JwtUser.objects.get(username=payload['username'])
        friend_username = request.data.get('friend_username')

        if not friend_username:
            return Response({'status': 'error', 'message': 'Missing friend username'}, status=status.HTTP_400_BAD_REQUEST)

        try:
            friend = JwtUser.objects.get(username=friend_username)
            
            if user not in friend.friend_requests.all():
                return Response({'status': 'error', 'message': 'No friend request from this user'}, status=status.HTTP_400_BAD_REQUEST)
            
            friend.friend_requests.remove(user)
            user.friends.add(friend)
            friend.friends.add(user)
            
            return Response({
                'status': 'success',
                'message': f'Friend request from {friend_username} accepted'
            }, status=status.HTTP_200_OK)
        
        except JwtUser.DoesNotExist:
            return Response({'status': 'error', 'message': 'User not found'}, status=status.HTTP_404_NOT_FOUND)


##--------------------------------------BLOCK-FRIEND-REQUEST-----------------------------------------### 
# 1.Vérification de l'authentification : Vérifie et décode le jeton JWT de l'en-tête d'autorisation.
# 2.Validation de l'utilisateur : Vérifie que l'utilisateur extrait du jeton existe dans la base de données.
# 3.Validation du nom d'utilisateur à bloquer : Vérifie la présence du nom d'utilisateur à bloquer dans la requête.
# 4.Vérification des conditions de blocage : Vérifie que l'utilisateur à bloquer existe, qu'il n'est pas l'utilisateur lui-même, et qu'il est dans la liste d'amis de l'utilisateur.
# 5.Blocage de l'utilisateur : Ajoute l'utilisateur à bloquer à la liste des utilisateurs bloqués, le retire de la liste d'amis, et retourne une réponse de succès ou d'erreur selon les résultats des vérifications.
class BlockUserView(APIView):
    def post(self, request):
        auth_header = request.headers.get('Authorization')
        if not auth_header:
            raise AuthenticationFailed('Unauthenticated')
        
        try:
            token = auth_header.split()[1]
            payload = jwt.decode(token, settings.JWT_SECRET, algorithms=['HS256'])
        except jwt.ExpiredSignatureError:
            raise AuthenticationFailed('Token expired')
        except (IndexError, jwt.DecodeError):
            raise AuthenticationFailed('Invalid token')

        try:
            user = JwtUser.objects.get(username=payload['username'])
        except JwtUser.DoesNotExist:
            raise AuthenticationFailed('User not found')

        user_to_block_username = request.data.get('username')
        if not user_to_block_username:
            return Response({'status': 'error', 'message': 'Missing username to block'}, status=status.HTTP_400_BAD_REQUEST)

        try:
            user_to_block = JwtUser.objects.get(username=user_to_block_username)
            
            if user_to_block == user:
                return Response({'status': 'error', 'message': 'Cannot block yourself'}, status=status.HTTP_400_BAD_REQUEST)
            
            # Nouvelle condition : vérifier si l'utilisateurs est dans la liste d'amis
            if user_to_block not in user.friends.all():
                return Response({'status': 'error', 'message': 'Can only block users from your friend list'}, status=status.HTTP_400_BAD_REQUEST)
            
            user.blocked_users.add(user_to_block)
            user.friends.remove(user_to_block)
            user_to_block.friends.remove(user)
            
            return Response({
                'status': 'success',
                'message': f'User {user_to_block_username} has been blocked and removed from friends'
            }, status=status.HTTP_200_OK)
        except JwtUser.DoesNotExist:
            return Response({'status': 'error', 'message': 'User not found'}, status=status.HTTP_404_NOT_FOUND)


##--------------------------------------GET-FRIEND-LIST-----------------------------------------###
# 1.Vérification de l'authentification : Vérifie et décode le jeton JWT de l'en-tête d'autorisation.
# 2.Validation de l'utilisateur : Vérifie que l'utilisateur extrait du jeton existe dans la base de données.
# 3.Récupération des amis : Récupère la liste des amis de l'utilisateur depuis la base de données.
# 4.Construction de la liste d'amis : Crée une liste d'amis avec les noms d'utilisateur des amis.
# 5.Retour de la réponse : Retourne une réponse de succès avec la liste des amis de l'utilisateur.
class FriendListView(APIView):
    def get(self, request):
        auth_header = request.headers.get('Authorization')
        if not auth_header:
            raise AuthenticationFailed('Unauthenticated')
        
        try:
            # Le format attendu est "Bearer <token>"
            token = auth_header.split()[1]
            payload = jwt.decode(token, settings.JWT_SECRET, algorithms=['HS256'])
        except jwt.ExpiredSignatureError:
            raise AuthenticationFailed('Token expired')
        except (IndexError, jwt.DecodeError):
            raise AuthenticationFailed('Invalid token')

        try:
            user = JwtUser.objects.get(username=payload['username'])
        except JwtUser.DoesNotExist:
            raise AuthenticationFailed('User not found')

        friends = user.friends.all()
        friend_list = [{'username': friend.username} for friend in friends]
        
        return Response({
            'status': 'success',
            'friends': friend_list
        }, status=status.HTTP_200_OK)
