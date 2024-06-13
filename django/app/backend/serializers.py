from rest_framework import serializers
from .models import User

class UserSerializer(serializers.ModelSerializer):
    class Meta:
        model = User
        fields = ('username', 'is_admin')
        # fields = ('content', 'created_at') # to expose arbitrary fields