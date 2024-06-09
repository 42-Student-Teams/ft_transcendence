from django.urls import path
from . import views


urlpatterns=[
    path('', views.index),
    path('create_user', views.create_user),
    path('users', views.UserListView.as_view(), name='user_list'),
]
