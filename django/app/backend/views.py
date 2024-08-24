import os

from django.conf import settings
from django.http import HttpResponse, HttpResponseForbidden, HttpResponseBadRequest, JsonResponse, FileResponse
from django.templatetags.static import static
from django.urls import reverse
from django.core.exceptions import ValidationError
from rest_framework.exceptions import AuthenticationFailed
from rest_framework.views import APIView
from rest_framework.parsers import MultiPartParser, FormParser
from django.db.models import Q
#Q est spécifique à Django et fait partie de son ORM (Object-Relational Mapping).
#combine plusieurs conditions avec des opérateurs logiques OR (|) ou AND (&).


import jwt
from .jwt_util import jwt_response, check_jwt
from .models import JwtUser, GameHistory

from rest_framework import status
from rest_framework.response import Response
from .serializers import JwtUserSerializer, MessageSerializer, GameHistorySerializer, GameHistoryCreateSerializer, PlayerStatsSerializer, GameHistoryWithAvatarSerializer

from .util import get_user_info

def index(request):
    return HttpResponse(f"Hello Transcendence, this route is deprecated")

def create_user(request):
    return HttpResponse(f"Hello Transcendence, this route is deprecated")


##--------------------------------------USER DATA - POST METHODE-----------------------------------------###
class UserCreateView(APIView):
    def post(self, request):
        print('--------------------')
        print(request.data)
        print('--------------------')
        serializer = JwtUserSerializer(data=request.data)
        serializer.is_valid(raise_exception=True)
        user = serializer.save()
        print(f"got username: {user.username}", flush=True)
        return jwt_response(user.username)
    
class UserOauthLoginView(APIView):
    def post(self, request):
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

        res = jwt_response(username)

        user: JwtUser = JwtUser.objects.get(username=username)
        if user is None:
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
        try:
            user: JwtUser = JwtUser.objects.get(username=username)
        except JwtUser.DoesNotExist:
            raise AuthenticationFailed('Incorrect username or password')
        if not user.check_password(password):
            raise AuthenticationFailed('Incorrect username or password')
        return jwt_response(username)

##--------------------------------------USER DATA - GET METHODE-----------------------------------------###
class UserListView(APIView):
    def get(self, request):
        if check_jwt(request):
            return ({'status': 'success'})
        else:
            raise AuthenticationFailed()

class getUserProfileView(APIView):
    def get(self, request):
        requesting_user = check_jwt(request)
        if not requesting_user:
            return Response({'status': 'error', 'message': 'Authentication required'}, status=status.HTTP_401_UNAUTHORIZED)

        try:
            user = JwtUser.objects.get(username=requesting_user)
            user.refresh_from_db() # Rafraîchit les données de l'utilisateur pour obtenir les champs mis à jour
            parties_jouees = GameHistory.objects.filter(Q(joueur1=user) | Q(joueur2=user)).count()
            parties_gagnees = GameHistory.objects.filter(gagnant=user).count()
            
            profile_data = {
            	'nom': user.last_name,
            	'prenom': user.first_name,
            	'username': user.username,
            	'avatar': user.avatar.url,
            	'parties_jouees': parties_jouees,
            	'parties_gagnees': parties_gagnees
            }
            
            return Response(profile_data, status=status.HTTP_200_OK)
        except JwtUser.DoesNotExist:
            return Response({'status': 'error', 'message': 'User not found'}, status=status.HTTP_404_NOT_FOUND)

##--------------------------------------USER DATA - PUT METHODE-----------------------------------------###
class ImprovedUpdateUserView(APIView):
    parser_classes = (MultiPartParser, FormParser)

    def put(self, request):
        try:
            user = JwtUser.objects.get(username=check_jwt(request))
        except JwtUser.DoesNotExist:
            return Response({'status': 'error', 'message': 'User not found'}, status=status.HTTP_404_NOT_FOUND)

        if 'first_name' in request.data:
            user.first_name = request.data['first_name']
        if 'last_name' in request.data:
            user.last_name = request.data['last_name']
        
        if 'avatar' in request.FILES:
            new_avatar = request.FILES['avatar']
            if not new_avatar.content_type.startswith('image'):
                return Response({'status': 'error', 'message': 'File is not a valid image'}, status=status.HTTP_400_BAD_REQUEST)
            
            # Check if current avatar is not the default one
            default_avatar_path = os.path.join(settings.STATIC_ROOT, 'avatars', 'default_avatar.png')
            if user.avatar and user.avatar.path != default_avatar_path:
                # Delete the old avatar file
                if os.path.isfile(user.avatar.path):
                    os.remove(user.avatar.path)
            
            # Update with new avatar
            user.avatar = new_avatar

        try:
            user.save()
        except ValidationError as e:
            return Response({'status': 'error', 'message': str(e)}, status=status.HTTP_400_BAD_REQUEST)

        return Response({
            'status': 'success',
            'message': 'Profile updated successfully',
            'user': {
                'username': user.username,
                'first_name': user.first_name,
                'last_name': user.last_name,
                'avatar_url': user.avatar.url,
            }
        }, status=status.HTTP_200_OK)
    


# class UserUpdateView(APIView):
#     parser_classes = (MultiPartParser, FormParser)
    
#     def post(self, request):
#         user = JwtUser.objects.get(username=check_jwt(request))
#         if not (request.method == 'POST' and request.FILES.get('avatar')):
#     # Send an error response
#             return JsonResponse({'status': 'error', 'message': 'Invalid request method or missing image file'}, status=400)
#         avatar = request.FILES['avatar']
#         # do a print of avatar
#         print(f"avatar: {avatar}")
#         first_name = request.data.get('nom')
#         last_name = request.data.get('prenom')
#         print(f"data: {request.data}")
#         # Vérifiez si le fichier est une image valide
#         if not avatar.content_type.startswith('image'):
#             return Response({'status': 'error', 'message': 'File is not a valid image'}, status=status.HTTP_400_BAD_REQUEST)
#         # Supprimez l'ancien avatar si il existe, si c'est un default_avatar.png, ne le supprimez pas
#         if user.avatar != 'staticfiles/avatars/default_avatar.png':
#             user.avatar.delete(save=False)
#         user.avatar = avatar
        
#         first_name = request.data.get('first_name')
#         last_name = request.data.get('last_name')
#         print(f"first_name: {first_name}, last_name: {last_name}")
        
#         if first_name is not None:
#             user.first_name = first_name

#         if last_name is not None:
#             user.last_name = last_name
#         try:
#             user.save()
#         except ValidationError as e:
#             return Response({'status': 'error', 'message': str(e)}, status=status.HTTP_400_BAD_REQUEST)
#         return Response({
#             'status': 'success',
#             'message': 'Profile updated successfully',
#             'avatar_url': user.avatar.url
#         }, status=status.HTTP_200_OK)

##--------------------------------------FRIEND-REQUEST-----------------------------------------###

class FriendView(APIView):
    def post(self, request):
        user = JwtUser.objects.get(username=check_jwt(request))

        friend_username = request.data.get('friend_username')
        if not friend_username:
            return Response({'status': 'error', 'message': 'Missing friend username'}, status=status.HTTP_400_BAD_REQUEST)

        try:
            friend = JwtUser.objects.get(username=friend_username)
            if user == friend:
                return Response({'status': 'error', 'message': 'Cannot send friend request to yourself'}, status=status.HTTP_400_BAD_REQUEST)

            if friend in user.friends.all():
                return Response({'status': 'error', 'message': 'Already friends'}, status=status.HTTP_400_BAD_REQUEST)

            if friend in user.friend_requests.all():
                return Response({'status': 'error', 'message': 'Friend request already sent'}, status=status.HTTP_400_BAD_REQUEST)

            if user in friend.friend_requests.all():
                return Response({'status': 'error', 'message': 'This user has already sent you a friend request'}, status=status.HTTP_400_BAD_REQUEST)

            friend.friend_requests.add(user)  # L'utilisateur actuel envoie une demande d'ami à l'ami

            return Response({
                'status': 'success',
                'message': f'Friend request sent to {friend_username}',
                'friend': {
                    'username': friend.username,
                    'status': 'Pending',
                    'profile_picture': friend.profile_picture.url if hasattr(friend, 'profile_picture') else None
                }
            }, status=status.HTTP_200_OK)
        except JwtUser.DoesNotExist:
            return Response({'status': 'error', 'message': 'User not found'}, status=status.HTTP_404_NOT_FOUND)


class AcceptFriendRequestView(APIView):
    def post(self, request):
        user = JwtUser.objects.get(username=check_jwt(request))

        friend_username = request.data.get('friend_username')
        if not friend_username:
            return Response({'status': 'error', 'message': 'Missing friend username'}, status=status.HTTP_400_BAD_REQUEST)

        try:
            friend = JwtUser.objects.get(username=friend_username)
            if friend not in user.friend_requests.all():  # Changement ici
                return Response({'status': 'error', 'message': 'No friend request from this user'}, status=status.HTTP_400_BAD_REQUEST)

            user.friend_requests.remove(friend)  # L'utilisateur actuel retire la demande d'ami
            user.friends.add(friend)
            friend.friends.add(user)

            return Response({
                'status': 'success',
                'message': f'Friend request from {friend_username} accepted'
            }, status=status.HTTP_200_OK)
        except JwtUser.DoesNotExist:
            return Response({'status': 'error', 'message': 'User not found'}, status=status.HTTP_404_NOT_FOUND)


class UnblockUserView(APIView):
    def post(self, request):
        user = JwtUser.objects.get(username=check_jwt(request))

        username_to_unblock = request.data.get('username')
        if not username_to_unblock:
            return Response({'status': 'error', 'message': 'Missing username to unblock'}, status=status.HTTP_400_BAD_REQUEST)

        try:
            user_to_unblock = JwtUser.objects.get(username=username_to_unblock)
            if user_to_unblock not in user.blocked_users.all():
                return Response({'status': 'error', 'message': 'This user is not blocked'}, status=status.HTTP_400_BAD_REQUEST)

            user.blocked_users.remove(user_to_unblock)
            user.friends.add(user_to_unblock)
            user_to_unblock.friends.add(user)

            return Response({
                'status': 'success',
                'message': f'User {username_to_unblock} has been unblocked'
            }, status=status.HTTP_200_OK)
        except JwtUser.DoesNotExist:
            return Response({'status': 'error', 'message': 'User not found'}, status=status.HTTP_404_NOT_FOUND)


##--------------------------------------BLOCK-FRIEND-REQUEST-----------------------------------------###
class BlockUserView(APIView):
    def post(self, request):
        user = JwtUser.objects.get(username=check_jwt(request))

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

class FriendListView(APIView):
    def get(self, request):
        try:
            user = JwtUser.objects.get(username=check_jwt(request))
            friends = user.friends.all()
            friend_list = [{
                'username': friend.username,
                'status': friend.status,
                'avatar': friend.avatar.url
                # 'avatar': request.build_absolute_uri(friend.avatar.url) if friend.avatar else request.build_absolute_uri(settings.MEDIA_URL + 'default_avatar.png')
            } for friend in friends]
            for friend in friend_list:
                print("\n Ici la haut " + friend['avatar'])
            
            
            return Response({
                'status': 'success',
                'friends': friend_list
            }, status=status.HTTP_200_OK)
        
        except JwtUser.DoesNotExist:
            return Response({
                'status': 'error',
                'message': 'Utilisateur non trouvé'
            }, status=status.HTTP_404_NOT_FOUND)
        
        except Exception as e:
            return Response({
                'status': 'error',
                'message': str(e)
            }, status=status.HTTP_500_INTERNAL_SERVER_ERROR)


class PendingListView(APIView):
    def get(self, request):
        user = JwtUser.objects.get(username=check_jwt(request))

        friend_requests = user.friend_requests.all()
        friend_list = [{'username': friend.username} for friend in friend_requests]

        return Response({
            'status': 'success',
            'friends': friend_list
        }, status=status.HTTP_200_OK)

class BlockedListView(APIView):
    def get(self, request):
        user = JwtUser.objects.get(username=check_jwt(request))

        blocked_users = user.blocked_users.all()
        blocked_list = [{'username': blocked_user.username} for blocked_user in blocked_users]

        return Response({
            'status': 'success',
            'blocked_users': blocked_list
        }, status=status.HTTP_200_OK)



###-----------------------------------MESSAGE API--------------------------------------------------###

class ChatGetMessagesView(APIView):
    def post(self, request):
        user = JwtUser.objects.get(username=check_jwt(request))
        print(f'Serving messages to user `{user.username}`', flush=True)

        message_amount = 10
        if request.data.get('message_amount') is None:
            return Response({
                'status': 'Param message_amount missing',
            }, status=status.HTTP_400_BAD_REQUEST)
        gotten_message_amount = int(request.data.get('message_amount'))
        # limiting to 10
        if gotten_message_amount < message_amount:
            message_amount = gotten_message_amount
        if request.data.get('friend_username') is None:
            return Response({
                'status': 'Param friend_username missing',
            }, status=status.HTTP_400_BAD_REQUEST)
        friend = JwtUser.objects.get(username=request.data.get('friend_username'))
        if friend is None:
            return Response({
                'status': 'Friend not found',
            }, status=status.HTTP_404_NOT_FOUND)
        start_id = None
        if request.data.get('start_id') is not None:
            start_id = int(request.data.get('start_id'))
        messages = user.get_last_x_messages_with_friend(friend, message_amount, start_id)

        serialized_messages = MessageSerializer(messages, many=True).data
        return Response({
            'status': 'success',
            'messages': serialized_messages,
            'got_all': len(messages) < message_amount
        }, status=status.HTTP_200_OK)

###-----------------------------GET PROFILE--------------------------------------------------------###

class getFriendProfileView(APIView):
    def get(self, request):
        requesting_user = check_jwt(request)
        if not requesting_user:
            return Response({'status': 'error', 'message': 'Authentication required'}, status=status.HTTP_401_UNAUTHORIZED)

        friend_username = request.GET.get('username')
        if not friend_username:
            return Response({'status': 'error', 'message': 'Username parameter is required'}, status=status.HTTP_400_BAD_REQUEST)

        try:
            user = JwtUser.objects.get(username=friend_username)
            requesting_user_obj = JwtUser.objects.get(username=requesting_user)

            if user not in requesting_user_obj.friends.all():
                return Response({'status': 'error', 'message': 'You can only view profiles of your friends'}, status=status.HTTP_403_FORBIDDEN)

            parties_jouees = GameHistory.objects.filter(Q(joueur1=user) | Q(joueur2=user)).count()
            parties_gagnees = GameHistory.objects.filter(gagnant=user).count()
            parties = GameHistory.objects.filter(Q(joueur1=user) | Q(joueur2=user)).order_by('-date_partie')
            serializer = GameHistoryWithAvatarSerializer(parties, many=True, context={'request': request})

            profile_data = {
                'nom': user.last_name,
                'prenom': user.first_name,
                'username': user.username,
                'status': user.status,
                'avatar': user.avatar.url if user.avatar else None,
                'parties_jouees': parties_jouees,
                'parties_gagnees': parties_gagnees,
                'parties_perdues': parties_jouees - parties_gagnees,
                'historique': serializer.data
            }

            return Response(profile_data, status=status.HTTP_200_OK)
        except JwtUser.DoesNotExist:
            return Response({'status': 'error', 'message': 'User not found'}, status=status.HTTP_404_NOT_FOUND)


###------------------------------GAME HISTORY VIEW-------------------------------------------------------###

class GameHistoryCreateView(APIView):
    def post(self, request, format=None):
        serializer = GameHistorySerializer(data=request.data)
        if serializer.is_valid():
            joueur1_username = serializer.validated_data['joueur1_username']
            joueur2_username = serializer.validated_data.get('joueur2_username')
            is_ai_opponent = serializer.validated_data.get('is_ai_opponent', False)
            ai_opponent_name = serializer.validated_data.get('ai_opponent_name')

            try:
                joueur1 = JwtUser.objects.get(username=joueur1_username)
            except JwtUser.DoesNotExist:
                return Response({'error': 'Joueur 1 non trouvé'}, status=status.HTTP_404_NOT_FOUND)

            joueur2 = None
            if not is_ai_opponent:
                try:
                    joueur2 = JwtUser.objects.get(username=joueur2_username)
                except JwtUser.DoesNotExist:
                    return Response({'error': 'Joueur 2 non trouvé'}, status=status.HTTP_404_NOT_FOUND)

            game_history = GameHistory.enregistrer_partie(
                joueur1=joueur1,
                joueur2=joueur2,
                duree_partie=serializer.validated_data['duree_partie'],
                score_joueur1=serializer.validated_data['score_joueur1'],
                score_joueur2=serializer.validated_data['score_joueur2'],
                is_ai_opponent=is_ai_opponent,
                ai_opponent_name=ai_opponent_name
            )

            return Response(GameHistorySerializer(game_history).data, status=status.HTTP_201_CREATED)
        return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)

class GameHistoryListView(APIView):
    def get(self, request):
        username = check_jwt(request)
        if not username:
            return Response({'status': 'error', 'message': 'Authentification requise'}, status=status.HTTP_401_UNAUTHORIZED)
        
        user = JwtUser.objects.get(username=username)
        parties = GameHistory.objects.filter(
            Q(joueur1=user) | 
            (Q(joueur2=user) & Q(is_ai_opponent=False)) |
            (Q(joueur1=user) & Q(is_ai_opponent=True))
        ).order_by('-date_partie')
        
        serializer = GameHistoryWithAvatarSerializer(parties, many=True, context={'request': request})
        return Response({
            'status': 'success',
            'historique': serializer.data
        }, status=status.HTTP_200_OK)

class PlayerStatsView(APIView):
    def get(self, request):
        username = check_jwt(request)
        if not username:
            return Response({'status': 'error', 'message': 'Authentification requise'}, status=status.HTTP_401_UNAUTHORIZED)
        
        user = JwtUser.objects.get(username=username)
        
        total_games = GameHistory.objects.filter(Q(joueur1=user) | Q(joueur2=user)).count()
        victories = GameHistory.objects.filter(gagnant=user).count()
        defeats = total_games - victories
        
        stats = {
            'total_games': total_games,
            'victories': victories,
            'defeats': defeats
        }
        
        serializer = PlayerStatsSerializer(stats)
        return Response(serializer.data, status=status.HTTP_200_OK)