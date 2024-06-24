from django.shortcuts import render, redirect
from django.http import HttpResponse
from backend.models import User

def index(request):
    return render(request, 'chat/index.html')

def login_view(request):
    if request.method == 'POST':
        username = request.POST.get('username')
        if not username:
            return HttpResponse("Username not provided", status=400)
        
        try:
            user = User.objects.get(username=username)
            return redirect('chat_room', username=username)
        except User.DoesNotExist:
            return render(request, 'chat/login.html', {'error': "Invalid username"})
    return render(request, 'chat/login.html')

def chat_room(request, username):
    try:
        user = User.objects.get(username=username)
    except User.DoesNotExist:
        return HttpResponse("Invalid username", status=400)

    return render(request, 'chat/room.html', {'username': username})
