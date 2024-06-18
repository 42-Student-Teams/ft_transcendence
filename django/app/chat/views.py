from django.shortcuts import render

def chat_index(request):
    return render(request, 'chat/room.html')