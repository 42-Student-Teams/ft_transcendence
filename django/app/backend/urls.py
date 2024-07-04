from django.urls import path
from . import views


urlpatterns=[
    path('', views.index),
    path('create_user', views.UserCreateView.as_view(), name='create_user'),
    path('login', views.UserLoginView.as_view(), name='login'),
    path('users', views.UserListView.as_view(), name='user_list'),
    path('oauth/login-42api', views.LoginAPIView.as_view(), name='login-42api'),
    path('oauth/callback', views.OAuthCallbackAPIView.as_view(), name='callback'),
]
