from rest_framework import serializers
from rest_framework.exceptions import PermissionDenied

from .models import User, JwtUser, Message
from .util import get_user_info


class UserSerializer(serializers.ModelSerializer):
    class Meta:
        model = User
        fields = ('username', 'is_admin')
        # fields = ('content', 'created_at') # to expose arbitrary fields

class JwtUserSerializer(serializers.ModelSerializer):
    class Meta:
        model = JwtUser
        fields = ('username', 'password', 'isoauth')
        extra_kwargs = {
            'password': {'write_only': True},
        }

    def create(self, validated_data):
        password = validated_data.pop('password', None)
        instance = self.Meta.model(**validated_data)
        instance.set_password(password)
        '''elif password is None and oauth_token is not None:
            user_info = get_user_info(oauth_token)
            if user_info is None:
                raise PermissionDenied
            instance.username = user_info['login']
            if JwtUser.objects.filter(username=instance.username).exists():
                return JwtUser.objects.get(username=instance.username)
            instance.set_unusable_password()
            instance.isoauth = True
        else:
            raise PermissionDenied'''
        instance.save()
        return instance

class MessageSerializer(serializers.ModelSerializer):
    author_username = serializers.CharField(source='author.username', read_only=True)
    recipient_username = serializers.CharField(source='recipient.username', read_only=True)

    class Meta:
        model = Message
        fields = ('id', 'author_username', 'recipient_username', 'content', 'timestamp')