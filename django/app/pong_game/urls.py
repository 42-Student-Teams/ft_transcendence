
from django.urls import path
#now import the views.py file into this code
from . import views
urlpatterns=[
  path('',views.index),
  path('pong_game', views.pong_game, name='pong_game'),
  path('hello', views.hello_view, name='hello'),
]
#   path('pong_game', views.TestView.as_view(), name='pong_game'),