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
    path('users', views.UserListView.as_view(), name='user_list'),
    path('user_update', views.UserUpdateView.as_view(), name='user_update'),
    path('send_friend_request', views.FriendView.as_view(), name='send_friend_request'),
    path('accept_friend_request', views.AcceptFriendRequestView.as_view(), name='accept_friend_request'),
    path('unblock_user', views.UnblockUserView.as_view(), name='unblock_user'),
    path('block_user', views.BlockUserView.as_view(), name='block_user'),
    path('friend_list', views.FriendListView.as_view(), name='friend_list'),
    path('pending_list', views.PendingListView.as_view(), name='pending_list'),
    path('block_list', views.BlockedListView.as_view(), name='block_list'),
    path('update_avatar', views.UpdateProfilePictureView.as_view(), name='update_avatar'),
    path('chat_get_messages', views.ChatGetMessagesView.as_view(), name='chat_get_messages'),
    path('get_userProfile', views.getUserProfileView.as_view(), name='get_user_profile'),
    path('history_getGames', views.GameHistoryListView.as_view(), name='history_getGames'),
    path('history_postGames', views.GameHistoryCreateView.as_view(), name='history_postGames'),
    path('avatars', views.ImageView.as_view(), name='png'),
    # path('test', views.test_avatar, name='default_avatar'),
    #path('default-avatar/', views.DefaultAvatarView.as_view(), name='default_avatar'),
    #path('friend_status', views.FriendStatusView.as_view(), name='friend_status'),
] + static(settings.STATIC_URL, document_root=settings.STATIC_ROOT)

#urlpatterns += static(settings.MEDIA_URL, document_root=settings.MEDIA_ROOT)