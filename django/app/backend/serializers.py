from rest_framework import serializers, status
from rest_framework.exceptions import PermissionDenied
from rest_framework.response import Response
from django.conf import settings

from .models import User, JwtUser, Message, GameHistory
from .util import get_user_info


#-----------------------------------------User's--------------------------------------#
class UserSerializer(serializers.ModelSerializer):
    class Meta:
        model = User
        fields = ('username', 'is_admin')
        # fields = ('content', 'created_at') # to expose arbitrary fields

class JwtUserSerializer(serializers.ModelSerializer):
    class Meta:
        model = JwtUser
        fields = ('username', 'password', 'isoauth', 'first_name', 'last_name')
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

#-----------------------------------------Game History--------------------------------------#

class GameHistorySerializer(serializers.ModelSerializer):
    joueur1_username = serializers.CharField(write_only=True)
    joueur2_username = serializers.CharField(write_only=True, required=False, allow_null=True)
    is_ai_opponent = serializers.BooleanField(default=False)
    ai_opponent_name = serializers.CharField(required=False, allow_null=True)
    gagnant_username = serializers.SerializerMethodField(read_only=True)

    class Meta:
        model = GameHistory
        fields = ['joueur1_username', 'joueur2_username', 'duree_partie', 'score_joueur1', 'score_joueur2',
                  'is_ai_opponent', 'ai_opponent_name', 'date_partie', 'gagnant', 'gagnant_username']
        read_only_fields = ['date_partie', 'gagnant']

    def validate(self, data):
        if data.get('is_ai_opponent') and not data.get('ai_opponent_name'):
            raise serializers.ValidationError("ai_opponent_name est requis lorsque is_ai_opponent est True")
        if not data.get('is_ai_opponent') and not data.get('joueur2_username'):
            raise serializers.ValidationError("joueur2_username est requis lorsque is_ai_opponent est False")
        return data

    def get_gagnant_username(self, obj):
        if obj.gagnant:
            return obj.gagnant.username
        elif obj.is_ai_opponent and obj.score_joueur2 > obj.score_joueur1:
            return obj.ai_opponent_name
        return None

    def to_representation(self, instance):
        ret = super().to_representation(instance)
        ret['joueur1_username'] = instance.joueur1.username
        if instance.joueur2:
            ret['joueur2_username'] = instance.joueur2.username
        return ret

class GameHistoryCreateSerializer(serializers.ModelSerializer):
    joueur1_username = serializers.CharField(write_only=True)
    joueur2_username = serializers.CharField(write_only=True, required=False, allow_null=True)
    is_ai_opponent = serializers.BooleanField(required=False, default=False)
    ai_opponent_name = serializers.CharField(required=False, allow_null=True, allow_blank=True)

    class Meta:
        model = GameHistory
        fields = ('joueur1_username', 'joueur2_username', 'is_ai_opponent', 'ai_opponent_name', 'duree_partie', 'score_joueur1', 'score_joueur2')

    def create(self, validated_data):
        joueur1 = JwtUser.objects.get(username=validated_data.pop('joueur1_username'))
        joueur2_username = validated_data.pop('joueur2_username', None)
        is_ai_opponent = validated_data.pop('is_ai_opponent', False)
        ai_opponent_name = validated_data.pop('ai_opponent_name', None)

        joueur2 = None
        if not is_ai_opponent and joueur2_username:
            joueur2 = JwtUser.objects.get(username=joueur2_username)

        return GameHistory.objects.create(
            joueur1=joueur1,
            joueur2=joueur2,
            is_ai_opponent=is_ai_opponent,
            ai_opponent_name=ai_opponent_name,
            **validated_data
        )

    def validate(self, data):
        is_ai_opponent = data.get('is_ai_opponent', False)
        joueur2_username = data.get('joueur2_username')
        ai_opponent_name = data.get('ai_opponent_name')

        if is_ai_opponent:
            if joueur2_username is not None:
                raise serializers.ValidationError("joueur2_username should be None when is_ai_opponent is True")
            if not ai_opponent_name:
                raise serializers.ValidationError("ai_opponent_name is required when is_ai_opponent is True")
        else:
            if ai_opponent_name:
                raise serializers.ValidationError("ai_opponent_name should not be provided when is_ai_opponent is False")
            if not joueur2_username:
                raise serializers.ValidationError("joueur2_username is required when is_ai_opponent is False")

        return data

class PlayerStatsSerializer(serializers.Serializer):
    total_games = serializers.IntegerField()
    victories = serializers.IntegerField()
    defeats = serializers.IntegerField()

class GameHistoryWithAvatarSerializer(serializers.ModelSerializer):
    joueur1_avatar = serializers.SerializerMethodField()
    joueur2_avatar = serializers.SerializerMethodField()
    joueur1_username = serializers.CharField(source='joueur1.username', read_only=True)
    joueur2_username = serializers.SerializerMethodField()
    gagnant_username = serializers.SerializerMethodField()
    
    class Meta:
        model = GameHistory
        fields = ['id', 'date_partie', 'joueur1_username', 'joueur2_username', 'duree_partie', 
                  'score_joueur1', 'score_joueur2', 'gagnant_username', 'is_ai_opponent', 
                  'ai_opponent_name', 'joueur1_avatar', 'joueur2_avatar']

    def get_joueur1_avatar(self, obj):
        if obj.joueur1 and obj.joueur1.avatar:
            return obj.joueur1.avatar.url
        return settings.STATIC_URL + 'avatars/default_avatar.png'

    def get_joueur2_avatar(self, obj):
        if obj.is_ai_opponent:
            return settings.STATIC_URL + 'avatars/default_avatar.png'
        elif obj.joueur2 and obj.joueur2.avatar:
            return obj.joueur2.avatar.url
        return settings.STATIC_URL + 'avatars/default_avatar.png'

    def get_joueur2_username(self, obj):
        if obj.is_ai_opponent:
            return obj.ai_opponent_name
        return obj.joueur2.username if obj.joueur2 else None

    def get_gagnant_username(self, obj):
        if obj.gagnant:
            return obj.gagnant.username
        elif obj.is_ai_opponent and obj.score_joueur2 > obj.score_joueur1:
            return obj.ai_opponent_name
        return None
