from django.urls import path
from . import views


urlpatterns=[
    path('', views.index),
    path('create_user', views.UserCreateView.as_view(), name='create_user'),
    path('login', views.UserLoginView.as_view(), name='login'),
    path('login_oauth', views.UserOauthLoginView.as_view(), name='login_oauth'),
    path('users', views.UserListView.as_view(), name='user_list'),
    path('user_exists', views.UserExistsView.as_view(), name='user_exists'),
    path('user_isoauth', views.UserIsOauth.as_view(), name='user_isoauth'),
]
