
# Create your views here.

from django.http import HttpResponse

from rest_framework import generics
from rest_framework.response import Response
from django.shortcuts import render


def index(request):
	return HttpResponse("Hello Geeks")


def pong_game(request):
    return HttpResponse("This is the Pong game view.")

def hello_view(request):
    return render(request, 'pong_game/hello.html')

# class TestView(generics.ListAPIView):
#     # queryset = User.objects.all()
#     # serializer_class = UserSerializer
#     # http_method_names = ['get']
#     # auth_level = AuthLevel.AUTH

#     def get(self, request, *args, **kwargs):
#         # if validate_token(request, self.auth_level) != TokenValidationResponse.VALID:
#         #     return respond_invalid_token(validate_token(request, self.auth_level))

#         return Response("Hello world")
