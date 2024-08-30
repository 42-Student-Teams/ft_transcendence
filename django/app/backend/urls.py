from django.urls import path
from . import views
from django.conf.urls.static import static
from django.conf import settings

#UpdateProfilePictureView

urlpatterns=[
    path('', views.index),
    path('create_user', views.UserCreateView.as_view(), name='create_user'),
    path('login', views.UserLoginView.as_view(), name='login'),
    path('login_oauth', views.UserOauthLoginView.as_view(), name='login_oauth'),
    path('send_friend_request', views.FriendView.as_view(), name='send_friend_request'),
    path('accept_friend_request', views.AcceptFriendRequestView.as_view(), name='accept_friend_request'),
    path('unblock_user', views.UnblockUserView.as_view(), name='unblock_user'),
    path('block_user', views.BlockUserView.as_view(), name='block_user'),
    path('friend_list', views.FriendListView.as_view(), name='friend_list'),
    path('pending_list', views.PendingListView.as_view(), name='pending_list'),
    path('block_list', views.BlockedListView.as_view(), name='block_list'),
    path('chat_get_messages', views.ChatGetMessagesView.as_view(), name='chat_get_messages'),
    path('get_friend_profile', views.getFriendProfileView.as_view(), name='get_friend_profile'),
    path('get_user_profile', views.getUserProfileView.as_view(), name='get_user_profile'),
    path('update_user', views.ImprovedUpdateUserView.as_view(), name='update_user'),
    path('get_game_stats', views.PlayerStatsView.as_view(), name='get_game_stats'),
    path('history_getGames', views.GameHistoryListView.as_view(), name='history_getGames'),
    path('match_available', views.MatchRequestAvailableView.as_view(), name='match_available'),
    path('create_tournament', views.CreateTournamentView.as_view(), name='create_tournament'),
    path('join_tournament', views.JoinTournamentView.as_view(), name='join_tournament'),
    path('quit_tournament', views.QuitTournamentView.as_view(), name='quit_tournament'),
	path('get_logged_in_status', views.loggedInStatusView.as_view(), name='get_logged_in_status'),
    path('get_oauth_token', views.GetOauthTokenView.as_view(), name='get_oauth_token'),
] + static(settings.STATIC_URL, document_root=settings.STATIC_ROOT)
