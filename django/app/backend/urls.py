from django.urls import path
from . import views

#PendingListView

urlpatterns=[
    path('', views.index),
    path('create_user', views.UserCreateView.as_view(), name='create_user'),
    path('login', views.UserLoginView.as_view(), name='login'),
    path('login_oauth', views.UserOauthLoginView.as_view(), name='login_oauth'),
    path('users', views.UserListView.as_view(), name='user_list'),
    path('user_exists', views.UserExistsView.as_view(), name='user_exists'),
    path('user_isoauth', views.UserIsOauth.as_view(), name='user_isoauth'),
    path('send_friend_request', views.FriendView.as_view(), name='send_friend_request'),
    path('accept_friend_request', views.AcceptFriendRequestView.as_view(), name='accept_friend_request'),
    path('block_user', views.BlockUserView.as_view(), name='block_user'),
    path('friend_list', views.FriendListView.as_view(), name='friend_list'),
    path('pending_list', views.PendingListView.as_view(), name='pending_list'),
]
