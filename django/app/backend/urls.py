from django.urls import path
from . import views



urlpatterns=[
    path('', views.index),
    path('create_user', views.UserCreateView.as_view(), name='create_user'),
    path('login', views.UserLoginView.as_view(), name='login'),
    path('users', views.UserListView.as_view(), name='user_list'),
    path('oauth/callback/', views.oauth_callback, name='oauth_callback'),
    path('oauth/config/', views.get_oauth_config, name='get_oauth_config'),
]
