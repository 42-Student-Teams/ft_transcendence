import os

import requests
from asgiref.sync import async_to_sync
from channels.layers import get_channel_layer
from django.conf import settings
from django.http import HttpResponse, HttpResponseForbidden, HttpResponseBadRequest, JsonResponse, FileResponse
from rest_framework.exceptions import AuthenticationFailed
from rest_framework.views import APIView
from rest_framework.parsers import MultiPartParser, FormParser
from django.db.models import Q, F
from django.utils.text import slugify

from .jwt_util import jwt_response, check_jwt
from .models import (JwtUser, GameHistory, MatchRequest, Tournament, TournamentSearchQueue, AcknowledgedMatchRequest,
                     TournamentPvPQueue)

from rest_framework import status
from rest_framework.response import Response
from .serializers import (JwtUserSerializer, MessageSerializer, PlayerStatsSerializer, GameHistoryWithAvatarSerializer,
                          UserLoginSerializer, ImprovedUserProfileSerializer, FriendUsernameSerializer,
                          UsernameSerializer, ChatMessagesSerializer)

from .util import get_user_info
from app.settings import logger


def index(request):
    return HttpResponse(f"Hello Transcendence, this route is deprecated")

def create_user(request):
    return HttpResponse(f"Hello Transcendence, this route is deprecated")


##--------------------------------------USER DATA - POST METHODE-----------------------------------------###
class UserCreateView(APIView):
    def post(self, request):
        logger.debug('--------------------')
        logger.debug(request.data)
        logger.debug('--------------------')
        serializer = JwtUserSerializer(data=request.data)
        if serializer.is_valid():
            user = serializer.save()
            logger.debug(f"got username: {user.username}")
            return jwt_response(user.username)
        else:
            errors = []
            for error_msgs in serializer.errors.values():
                errors.extend([f"({error})" for error in error_msgs])
            logger.debug(f"Validation errors: {errors}")
            return Response({"errors": errors}, status=status.HTTP_400_BAD_REQUEST)

class UserOauthLoginView(APIView):
    def post(self, request):
        oauth_token = None
        username = None
        email = None
        first_name = None
        last_name = None
        if 'oauth_token' in request.data:
            oauth_token = request.data['oauth_token']
        if oauth_token is not None:
            user_info = get_user_info(oauth_token)
            if user_info is not None:
                username = user_info['login']
            else:
                raise AuthenticationFailed()
            if 'email' in user_info:
                email = user_info['email']
            if 'first_name' in user_info:
                first_name = user_info['first_name']
            if 'last_name' in user_info:
                last_name = user_info['last_name']
        else:
            raise AuthenticationFailed()

        res = jwt_response(username)

        user: JwtUser = JwtUser.objects.filter(username=username).first()
        if user is None:
            new_user: JwtUser = JwtUser.objects.create()
            new_user.username = username
            new_user.email = email
            new_user.first_name = first_name
            new_user.last_name = last_name
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
        serializer = UserLoginSerializer(data=request.data)
        if not serializer.is_valid():
            return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)

        username = serializer.validated_data['username']
        password = serializer.validated_data['password']
        
        user: JwtUser = JwtUser.objects.filter(username=username).first()
        
        if user is None or not user.check_password(password):
            return Response(
                {"erreur": "Incorrect username or password"},
                status=status.HTTP_400_BAD_REQUEST
            )
        
        return jwt_response(username)

##--------------------------------------USER DATA - GET METHODE-----------------------------------------###
class loggedInStatusView(APIView):
    def get(self, request):
        if check_jwt(request):
            return Response({'status': 'success',}, status=status.HTTP_200_OK)
        else:
            raise AuthenticationFailed()
        

class getUserProfileView(APIView):
    def get(self, request):
        user = JwtUser.objects.filter(username=check_jwt(request)).first()
        if user is None:
            return Response({'status': 'error', 'message': 'User not found'}, status=status.HTTP_404_NOT_FOUND)
        user.refresh_from_db() # Rafraîchit les données de l'utilisateur pour obtenir les champs mis à jour
        parties_jouees = GameHistory.objects.filter(Q(joueur1=user) | Q(joueur2=user)).count()
        parties_gagnees = GameHistory.objects.filter(gagnant=user).count()

        profile_data = {
            'nom': user.last_name,
            'prenom': user.first_name,
            'username': user.username,
            'avatar': user.avatar.url,
            'parties_jouees': parties_jouees,
            'parties_perdues': parties_jouees - parties_gagnees,
            'parties_gagnees': parties_gagnees
        }

        return Response(profile_data, status=status.HTTP_200_OK)


##--------------------------------------USER DATA - PUT METHODE-----------------------------------------###
class ImprovedUpdateUserView(APIView):
    parser_classes = (MultiPartParser, FormParser)

    def put(self, request):
        try:
            user = JwtUser.objects.get(username=check_jwt(request))
        except JwtUser.DoesNotExist:
            return Response({'status': 'error', 'message': 'User not found'}, status=status.HTTP_404_NOT_FOUND)

        serializer = ImprovedUserProfileSerializer(user, data=request.data, partial=True)
        if not serializer.is_valid():
            return Response({'status': 'error', 'message': serializer.errors}, status=status.HTTP_400_BAD_REQUEST)

        if 'avatar' in request.FILES:
            avatar = request.FILES['avatar']
            if user.avatar.name != 'staticfiles/avatars/default_avatar.png':
                user.avatar.delete(save=False)
            
            file_name = self.generate_safe_filename(avatar.name)
            avatar.name = file_name

        serializer.save()

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

    def generate_safe_filename(self, filename):
        name, ext = os.path.splitext(filename)
        safe_name = slugify(name)
        return f"{safe_name}{ext}"


##--------------------------------------FRIEND-REQUEST-----------------------------------------###

class FriendView(APIView):
    def post(self, request):
        user = JwtUser.objects.filter(username=check_jwt(request)).first()
        if not user:
            return Response({'status': 'error', 'message': 'User not found'}, status=status.HTTP_404_NOT_FOUND)

        serializer = FriendUsernameSerializer(data=request.data)
        
        if not serializer.is_valid():
            return Response({'status': 'error', 'message': serializer.errors}, status=status.HTTP_400_BAD_REQUEST)

        friend_username = serializer.validated_data['friend_username']
        friend = JwtUser.objects.filter(username=friend_username).first()
        if not friend:
            return Response({'status': 'error', 'message': 'Friend not found'}, status=status.HTTP_404_NOT_FOUND)

        if user == friend:
            return Response({'status': 'error', 'message': 'You cannot send a friend request to yourself.'}, status=status.HTTP_400_BAD_REQUEST)

        if friend in user.friends.all():
            return Response({'status': 'error', 'message': 'You are already friends with this user.'}, status=status.HTTP_400_BAD_REQUEST)

        if friend in user.friend_requests.all():
            return Response({'status': 'error', 'message': 'A friend request has already been sent to this user.'}, status=status.HTTP_400_BAD_REQUEST)

        if user in friend.friend_requests.all():
            return Response({'status': 'error', 'message': 'This user has already sent you a friend request.'}, status=status.HTTP_400_BAD_REQUEST)

        friend.friend_requests.add(user)

        return Response({
            'status': 'success',
            'message': f'Friend request sent to {friend_username}',
            'friend': {
                'username': friend.username,
                'status': 'Pending',
                'avatar_url': friend.avatar.url if friend.avatar else None
            }
        }, status=status.HTTP_200_OK)


class AcceptFriendRequestView(APIView):
    def post(self, request):
        user = JwtUser.objects.filter(username=check_jwt(request)).first()
        if not user:
            return Response({'status': 'error', 'message': 'User not found'}, status=status.HTTP_404_NOT_FOUND)

        serializer = FriendUsernameSerializer(data=request.data)
        
        if not serializer.is_valid():
            return Response({'status': 'error', 'message': serializer.errors}, status=status.HTTP_400_BAD_REQUEST)

        friend_username = serializer.validated_data['friend_username']
        friend = JwtUser.objects.filter(username=friend_username).first()
        if not friend:
            return Response({'status': 'error', 'message': 'Friend not found'}, status=status.HTTP_404_NOT_FOUND)

        if friend not in user.friend_requests.all():
            return Response({'status': 'error', 'message': 'No pending friend request from this user.'}, status=status.HTTP_400_BAD_REQUEST)

        user.friend_requests.remove(friend)
        user.friends.add(friend)
        friend.friends.add(user)

        return Response({
            'status': 'success',
            'message': f'Friend request from {friend_username} accepted'
        }, status=status.HTTP_200_OK)


class UnblockUserView(APIView):
    def post(self, request):
        user = JwtUser.objects.filter(username=check_jwt(request)).first()
        if not user:
            return Response({'status': 'error', 'message': 'User not found'}, status=status.HTTP_404_NOT_FOUND)

        serializer = UsernameSerializer(data=request.data)
        
        if not serializer.is_valid():
            return Response({'status': 'error', 'message': serializer.errors}, status=status.HTTP_400_BAD_REQUEST)

        username_to_unblock = serializer.validated_data['username']
        user_to_unblock = JwtUser.objects.filter(username=username_to_unblock).first()
        if not user_to_unblock:
            return Response({'status': 'error', 'message': 'User to unblock not found'}, status=status.HTTP_404_NOT_FOUND)

        if user_to_unblock not in user.blocked_users.all():
            return Response({'status': 'error', 'message': 'This user is not blocked.'}, status=status.HTTP_400_BAD_REQUEST)

        user.blocked_users.remove(user_to_unblock)

        return Response({
            'status': 'success',
            'message': f'User {username_to_unblock} has been unblocked'
        }, status=status.HTTP_200_OK)


##--------------------------------------BLOCK-FRIEND-REQUEST-----------------------------------------###

class BlockUserView(APIView):
    def post(self, request):
        user = JwtUser.objects.filter(username=check_jwt(request)).first()
        if not user:
            return Response({'status': 'error', 'message': 'User not found'}, status=status.HTTP_404_NOT_FOUND)

        serializer = UsernameSerializer(data=request.data)
        
        if not serializer.is_valid():
            return Response({'status': 'error', 'message': serializer.errors}, status=status.HTTP_400_BAD_REQUEST)

        username_to_block = serializer.validated_data['username']
        user_to_block = JwtUser.objects.filter(username=username_to_block).first()
        if not user_to_block:
            return Response({'status': 'error', 'message': 'User to block not found'}, status=status.HTTP_404_NOT_FOUND)

        if user_to_block == user:
            return Response({'status': 'error', 'message': 'You cannot block yourself.'}, status=status.HTTP_400_BAD_REQUEST)

        if user_to_block not in user.friends.all():
            return Response({'status': 'error', 'message': 'You can only block users from your friend list.'}, status=status.HTTP_400_BAD_REQUEST)

        user.blocked_users.add(user_to_block)
        user.friends.remove(user_to_block)
        user_to_block.friends.remove(user)

        return Response({
            'status': 'success',
            'message': f'User {username_to_block} has been blocked and removed from your friends'
        }, status=status.HTTP_200_OK)


##--------------------------------------GET-FRIEND-LIST-----------------------------------------###

class FriendListView(APIView):
    def get(self, request):
        #try:
        user = JwtUser.objects.filter(username=check_jwt(request)).first()
        if user is None:
            return Response({'status': 'error', 'message': 'User not found'}, status=status.HTTP_400_BAD_REQUEST)
        friends = user.friends.all()
        friend_list = [{
            'username': friend.username,
            'status': friend.status,
            'avatar': friend.avatar.url
            # 'avatar': request.build_absolute_uri(friend.avatar.url) if friend.avatar else request.build_absolute_uri(settings.MEDIA_URL + 'default_avatar.png')
        } for friend in friends]

        return Response({
            'status': 'success',
            'friends': friend_list
        }, status=status.HTTP_200_OK)

        '''except Exception as e:
            return Response({
                'status': 'error',
                'message': str(e)
            }, status=status.HTTP_500_INTERNAL_SERVER_ERROR)'''


class PendingListView(APIView):
    def get(self, request):
        user = JwtUser.objects.filter(username=check_jwt(request)).first()
        if user is None:
            return Response({'status': 'error', 'message': 'Missing username'}, status=status.HTTP_400_BAD_REQUEST)

        friend_requests = user.friend_requests.all()
        friend_list = [{
            'username': friend.username,
            'avatar': friend.avatar.url if friend.avatar else None
        } for friend in friend_requests]

        return Response({
            'status': 'success',
            'friends': friend_list
        }, status=status.HTTP_200_OK)

class BlockedListView(APIView):
    def get(self, request):
        user = JwtUser.objects.filter(username=check_jwt(request)).first()
        if user is None:
            return Response({'status': 'error', 'message': 'Missing username'}, status=status.HTTP_400_BAD_REQUEST)

        blocked_users = user.blocked_users.all()
        blocked_list = [{
            'username': blocked_user.username,
            'avatar': blocked_user.avatar.url if blocked_user.avatar else None
        } for blocked_user in blocked_users]

        return Response({
            'status': 'success',
            'blocked_users': blocked_list
        }, status=status.HTTP_200_OK)



###-----------------------------------MESSAGE API--------------------------------------------------###

class ChatGetMessagesView(APIView):
    def post(self, request):
        user = JwtUser.objects.filter(username=check_jwt(request)).first()
        if not user:
            return Response({'status': 'error', 'message': 'User not found'}, status=status.HTTP_404_NOT_FOUND)

        serializer = ChatMessagesSerializer(data=request.data)
        if not serializer.is_valid():
            return Response({'status': 'error', 'message': serializer.errors}, status=status.HTTP_400_BAD_REQUEST)

        message_amount = serializer.validated_data['message_amount']
        friend_username = serializer.validated_data['friend_username']
        start_id = serializer.validated_data.get('start_id')

        friend = JwtUser.objects.filter(username=friend_username).first()
        if not friend:
            return Response({'status': 'error', 'message': 'Friend not found'}, status=status.HTTP_404_NOT_FOUND)

        if friend not in user.friends.all():
            return Response({'status': 'error', 'message': 'You can only retrieve messages from your friends.'}, status=status.HTTP_403_FORBIDDEN)

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

        user = JwtUser.objects.filter(username=friend_username).first()
        if user is None:
            return Response({'status': 'error', 'message': 'User not found'}, status=status.HTTP_404_NOT_FOUND)
        requesting_user_obj = JwtUser.objects.filter(username=requesting_user).first()
        if requesting_user_obj is None:
            return Response({'status': 'error', 'message': 'User does not exist'}, status=status.HTTP_404_NOT_FOUND)

        if user not in requesting_user_obj.friends.all():
            return Response({'status': 'error', 'message': 'You can only view profiles of your friends'}, status=status.HTTP_403_FORBIDDEN)

        parties_jouees = GameHistory.objects.filter(Q(joueur1=user) | Q(joueur2=user)).count()
        parties_gagnees = GameHistory.objects.filter(gagnant=user).count()
        #add with the ai history games
        parties = GameHistory.objects.filter(Q(joueur1=user) | Q(joueur2=user)).order_by('-date_partie')
        serializer = GameHistoryWithAvatarSerializer(parties, many=True, context={'request': request})

        profile_data = {
            'nom': user.last_name,
            'prenom': user.first_name,
            'username': user.username,
            'status': user.status,
            'avatar': user.avatar.url if user.avatar else None,
            'parties_perdues': parties_jouees - parties_gagnees,
            'parties_jouees': parties_jouees,
            'parties_gagnees': parties_gagnees,
            'historique': serializer.data
        }

        return Response(profile_data, status=status.HTTP_200_OK)


###------------------------------GAME HISTORY VIEW-------------------------------------------------------###

class GameHistoryListView(APIView):
    def get(self, request):
        username = check_jwt(request)
        if not username:
            return Response({'status': 'error', 'message': 'Authentification requise'}, status=status.HTTP_401_UNAUTHORIZED)

        user = JwtUser.objects.filter(username=username).first()
        if user is None:
            return Response({'status': 'error', 'message': 'User does not exist'}, status=status.HTTP_404_NOT_FOUND)
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

        user = JwtUser.objects.filter(username=username).first()
        if user is None:
            return Response({'status': 'error', 'message': 'User does not exist'}, status=status.HTTP_404_NOT_FOUND)

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


# Returns whether 'author' has us invited to a game at the moment (filtering MatchRequest)
class MatchRequestAvailableView(APIView):
    def get(self, request):
        requesting_user = check_jwt(request)
        if not requesting_user:
            return Response({'status': 'error', 'message': 'Authentication required'},
                            status=status.HTTP_401_UNAUTHORIZED)
        requesting_user_object = JwtUser.objects.filter(username=requesting_user).first()
        if not requesting_user_object:
            return Response({'status': 'error', 'message': 'User does not exist'}, status=status.HTTP_404_NOT_FOUND)

        author_username = request.GET.get('author')
        if not author_username:
            return Response({'status': 'error', 'message': 'match_key author is required'},
                            status=status.HTTP_400_BAD_REQUEST)
        author = JwtUser.objects.filter(username=author_username).first()
        if not author:
            return Response({'status': 'error', 'message': 'User does not exist'}, status=status.HTTP_404_NOT_FOUND)
        match_request: MatchRequest = MatchRequest.objects.filter(request_author=author,
                                                                  target_user=requesting_user_object).first()
        if match_request is None or requesting_user_object != match_request.target_user:
            return Response({'available': 'false'}, status=status.HTTP_200_OK)
        else:
            return Response({'available': 'true'}, status=status.HTTP_200_OK)


class CreateTournamentView(APIView):
    def post(self, request):
        user = JwtUser.objects.filter(username=check_jwt(request)).first()
        if user is None:
            return Response({'status': 'error', 'message': 'Not authed'}, status=status.HTTP_400_BAD_REQUEST)
        
        logger.debug(f'User `{user}` wants to create a tournament')

        existing_tournament = Tournament.objects.filter(initiated_by=user).first()
        if existing_tournament is not None:
            return Response({'status': 'error', 'message': 'User already has a tournament'}, status=status.HTTP_400_BAD_REQUEST)

        props = ['name', 'ball_color', 'fast', 'all_participants_count', 'author_nickname', 'bot_list']
        for prop in props:
            if request.data.get(prop) is None:
                return Response({'status': 'error', 'message': f'Missing parameter {prop}'}, status=status.HTTP_400_BAD_REQUEST)

        all_participants_count = settings.MAX_TOURNAMENT_PLAYERS
        
        color = request.data.get('color')
        if color not in ['black', 'red', 'blue']:
            color = 'black'

        fast = request.data.get('fast')
        if type(fast) != bool:
            fast = False

        author_nickname = request.data.get('author_nickname')
        if len(author_nickname) == 0 or len(author_nickname) > settings.MAX_NAME_LENGTH:
            return Response({'status': 'error', 'message': 'Bad nickname'}, status=status.HTTP_400_BAD_REQUEST)

        name = request.data.get('name')
        if len(name) == 0 or len(name) > settings.MAX_NAME_LENGTH:
            return Response({'status': 'error', 'message': 'Bad name'}, status=status.HTTP_400_BAD_REQUEST)

        bot_list = request.data.get('bot_list')
        logger.debug(bot_list)
        if type(bot_list) != list:
            return Response({'status': 'error', 'message': 'Bad bot param'}, status=status.HTTP_400_BAD_REQUEST)

        bot_list = bot_list[:all_participants_count - 1]
        for bot_name in bot_list:
            if len(bot_name) == 0 or len(bot_name) > settings.MAX_NAME_LENGTH:
                return Response({'status': 'error', 'message': 'Bad bot name'}, status=status.HTTP_400_BAD_REQUEST)

        tournament = Tournament(
            name=name,
            initiated_by=user,
            ball_color=color,
            fast=fast,
            all_participants_count=all_participants_count,
            subscribed_count=1 + len(bot_list)
            )

        tournament.waitlist.append(f'user:{user.username}:{author_nickname}')
        for bot_name in bot_list:
            tournament.waitlist.append(f'bot:{bot_name}')

        channel_layer = get_channel_layer()
        # Get players in queue
        if tournament.subscribed_count < settings.MAX_TOURNAMENT_PLAYERS:
            players_in_queue = TournamentSearchQueue.get_up_to_x_users(settings.MAX_TOURNAMENT_PLAYERS - tournament.subscribed_count)
            for player, player_nickname in players_in_queue:
                tournament.waitlist.append(f'user:{player.username}:{player_nickname}')
                tournament.subscribed_count += 1
                async_to_sync(channel_layer.group_send)(player.username,
                                                                {"type": "toast", "msg_obj": {
                                                                "localization": f"%joinedTournament% {name}",
                                                                 "target_user": player.username}})

        tournament.save()
        async_to_sync(channel_layer.group_send)(user.username,
                                                {"type": "toast", "msg_obj": {
                                                 "localization": f"%joinedTournament% {name}",
                                                 "target_user": user.username}})

        return Response({
            'status': 'success',
        }, status=status.HTTP_200_OK)


class JoinTournamentView(APIView):
    def post(self, request):
        channel_layer = get_channel_layer()
        user = JwtUser.objects.filter(username=check_jwt(request)).first()
        if user is None:
            return Response({'status': 'error', 'message': 'Not authed'}, status=status.HTTP_400_BAD_REQUEST)
        
        logger.debug(f'User `{user}` wants to join a tournament')

        nickname = request.data.get('nickname')
        if nickname is None or len(nickname) == 0 or len(nickname) > settings.MAX_NAME_LENGTH:
            return Response({'status': 'error', 'message': 'Bad nickname'}, status=status.HTTP_400_BAD_REQUEST)

        tournaments = Tournament.objects.all()
        for tournament in tournaments:
            for entry in tournament.waitlist:
                if entry.startswith(f'user:{user.username}:'):
                    return Response({'status': 'error', 'message': 'User already in tournament'}, status=status.HTTP_400_BAD_REQUEST)
        
        existing_tournament = Tournament.objects.filter(initiated_by=user).first()
        if existing_tournament is not None:
            return Response({'status': 'error', 'message': 'User already has a tournament'}, status=status.HTTP_400_BAD_REQUEST)

        free_tournament = Tournament.objects.filter(subscribed_count__lt=F('all_participants_count'), op_lock=False).first()
        if free_tournament is not None:
            free_tournament.waitlist.append(f'user:{user.username}:{nickname}')
            free_tournament.subscribed_count += 1
            free_tournament.save()
            async_to_sync(channel_layer.group_send)(user.username,
                                                    {"type": "toast", "msg_obj": {
                                                    "localization": f"%joinedTournament% {free_tournament.name}",
                                                     "target_user": user.username}})
        else:
            TournamentSearchQueue.add_user_to_queue(user, nickname)
            async_to_sync(channel_layer.group_send)(user.username,
                                                    {"type": "toast", "msg_obj": {
                                                        "localization": f"%joinedTournamentQueue%",
                                                        "target_user": user.username}})

        return Response({
            'status': 'success',
        }, status=status.HTTP_200_OK)


class QuitTournamentView(APIView):
    def post(self, request):
        channel_layer = get_channel_layer()
        user = JwtUser.objects.filter(username=check_jwt(request)).first()
        if user is None:
            return Response({'status': 'error', 'message': 'Not authed'}, status=status.HTTP_400_BAD_REQUEST)

        logger.debug(f'User `{user}` wants to quit a tournament')

        tournament_id = request.data.get('tournament_id')
        match_key = request.data.get('match_key')
        if tournament_id is None or tournament_id is None:
            return Response({'status': 'error', 'message': 'Bad tournament id or match key'}, status=status.HTTP_400_BAD_REQUEST)

        controller_channel_name = f'controller_{request.data.get('match_key')}'
        try:
            async_to_sync(channel_layer.group_send)(controller_channel_name,
                                                    {"type": "player_disconnect", "msg_obj": {
                                                        "username": user.username,
                                                        "who": user.username
                                                    }})
        except:
            pass

        tournament = Tournament.objects.filter(id=tournament_id).first()
        if tournament is None:
            return Response({'status': 'error', 'message': 'Tournament not found'},
                            status=status.HTTP_400_BAD_REQUEST)

        tournament.amount_players_quit += 1
        tournament.save()
        tournament.remove_from_waitlist(user.username)

        match_acknowledgement: AcknowledgedMatchRequest = (AcknowledgedMatchRequest.
                                                           objects.filter(match_key=match_key).first())
        if match_acknowledgement is not None:
            if user == match_acknowledgement.request_author:
                Tournament.report_results(match_acknowledgement.opponent_nickname, match_acknowledgement.author_nickname, tournament_id)
            else:
                Tournament.report_results(match_acknowledgement.author_nickname, match_acknowledgement.opponent_nickname, tournament_id)

            channel_layer = get_channel_layer()
            if TournamentPvPQueue.is_user_in_queue(match_acknowledgement.request_author):
                TournamentPvPQueue.remove_user_from_queue(match_acknowledgement.request_author)
            async_to_sync(channel_layer.group_send)(match_acknowledgement.request_author.username,
                                                        {"type": "relay_bye", "msg_obj": {
                                                            "target_user": match_acknowledgement.request_author.username,
                                                            "match_key": match_acknowledgement.match_key,
                                                        }})
            if TournamentPvPQueue.is_user_in_queue(match_acknowledgement.target_user):
                TournamentPvPQueue.remove_user_from_queue(match_acknowledgement.target_user)
            if match_acknowledgement.target_user is not None:
                async_to_sync(channel_layer.group_send)(match_acknowledgement.target_user.username,
                                                        {"type": "relay_bye", "msg_obj": {
                                                            "target_user": match_acknowledgement.target_user.username,
                                                            "match_key": match_acknowledgement.match_key,
                                                        }})

            AcknowledgedMatchRequest.objects.filter(match_key=match_key).delete()

        return Response({
            'status': 'success',
        }, status=status.HTTP_200_OK)


class GetOauthTokenView(APIView):
    def post(self, request):

        #user = JwtUser.objects.filter(username=check_jwt(request)).first()
        #if user is None:
        #    return Response({'status': 'error', 'message': 'Not authed'}, status=status.HTTP_400_BAD_REQUEST)
        
        logger.debug(f'Getting token...')
        code = request.data.get('code')
        if code is None:
            return Response({'status': 'error', 'message': 'Missing code'}, status=status.HTTP_400_BAD_REQUEST)

        #url = os.getenv('TOKEN_URL')
        url = 'https://api.intra.42.fr/oauth/token'
        params = {
            'grant_type': 'authorization_code',
            'client_id': os.getenv('CLIENT_ID'),
            'client_secret': os.getenv('CLIENT_SECRET'),
            'code': code,
            'redirect_uri': os.getenv('REDIRECT_URI').replace('%IP%', os.getenv('BACKEND_IP')),
        }

        try:
            response = requests.post(url, json=params, headers={'Content-Type': 'application/json'})
            logger.debug(response.text)
            if response.status_code != 200:
                raise Exception(f'HTTP error! status: {response.status_code}')

            data = response.json()
            return Response(data, status=status.HTTP_200_OK)
        except Exception as error:
            logger.error('Error fetching access token:', error)
            return Response({'status': 'error', 'message': str(error)}, status=status.HTTP_500_INTERNAL_SERVER_ERROR)