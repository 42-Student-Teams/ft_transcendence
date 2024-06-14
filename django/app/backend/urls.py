from django.urls import path
from . import views


urlpatterns=[
    path('', views.index),
    path('create_user', views.UserCreateView.as_view(), name='create_user'),
    path('login', views.UserLoginView.as_view(), name='login'),
    path('users', views.UserListView.as_view(), name='user_list'),
]
