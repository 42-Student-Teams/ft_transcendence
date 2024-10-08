from rest_framework import serializers, status
from rest_framework.exceptions import PermissionDenied, ValidationError
from rest_framework.response import Response
from django.core.validators import RegexValidator, MinLengthValidator, EmailValidator,FileExtensionValidator
from django.conf import settings

from .models import JwtUser, Message, GameHistory
import re


default_avatar = '/staticfiles/avatars/default_avatar.png'

#-----------------------------------------User's DATA--------------------------------------#
class JwtUserSerializer(serializers.ModelSerializer):
    username = serializers.CharField(
        min_length=3,
        max_length=20,
        validators=[
            RegexValidator(
                regex='^[a-zA-Z0-9_]+$',
                message='The username can only contain letters, numbers, and underscores.'
            )
        ]
    )
    first_name = serializers.CharField(max_length=20, required=True)
    last_name = serializers.CharField(max_length=20, required=True)
    email = serializers.EmailField(
        validators=[EmailValidator(message="Please enter a valid email address.")],
        required=True
    )

    class Meta:
        model = JwtUser
        fields = ('username', 'password', 'isoauth', 'first_name', 'last_name', 'email')
        extra_kwargs = {
            'password': {'write_only': True},
        }

    def validate_username(self, value):
        if JwtUser.objects.filter(username=value).exists():
            raise serializers.ValidationError("A user with this username already exists.")
        return value

    def validate_name_field(self, value, field_name):
        if not value.strip():
            raise serializers.ValidationError(f"The {field_name} cannot be empty.")
        if value.isdigit():
            raise serializers.ValidationError(f"The {field_name} cannot contain only numbers.")
        if not re.match(r'^[a-zA-Z0-9]+$', value):
            raise serializers.ValidationError(f"The {field_name} can only contain letters and numbers.")
        return value

    def validate_first_name(self, value):
        return self.validate_name_field(value, "prénom")

    def validate_last_name(self, value):
        return self.validate_name_field(value, "nom")

    def validate_email(self, value):
        if JwtUser.objects.filter(email=value).exists():
            raise serializers.ValidationError("This email address is already in use.")
        return value

    def create(self, validated_data):
        password = validated_data.pop('password', None)
        instance = self.Meta.model(**validated_data)
        if password:
            instance.set_password(password)
        instance.save()
        return instance
    
#-----------------------------------------LOGIN DATA--------------------------------------#    
class UserLoginSerializer(serializers.Serializer):
    username = serializers.CharField(
        max_length=12,
        validators=[
            RegexValidator(
                regex='^[a-zA-Z0-9_]+$',
                message='The username must be alphanumeric or contain underscores',
                code='invalid_username'
            ),
        ]
    )
    password = serializers.CharField(max_length=128, write_only=True)

    def validate(self, data):
        username = data.get('username')
        password = data.get('password')
        
        if not username or not password:
            raise serializers.ValidationError("Username and password are required.")
        
        return data

#-----------------------------------------USER'S DATA UPDATED--------------------------------------#    

class UserProfileSerializer(serializers.ModelSerializer):
    class Meta:
        model = JwtUser
        fields = ('first_name', 'last_name', 'avatar')


class ImprovedUserProfileSerializer(UserProfileSerializer):
    class Meta(UserProfileSerializer.Meta):
        model = JwtUser
        fields = ('first_name', 'last_name', 'avatar')

    def validate_first_name(self, value):
        return self.validate_name(value, field_name="Prénom")

    def validate_last_name(self, value):
        return self.validate_name(value, field_name="Nom")

    def validate_name(self, value, field_name):
        value = self.sanitize_name(value)
        if not (1 <= len(value) <= 12 and re.match(r'^[\w\s-]+$', value)):
            raise serializers.ValidationError(f"{field_name} doit contenir entre 1 et 12 caractères et ne peut contenir que des lettres, des chiffres, des espaces et des tirets.")
        return value

    def sanitize_name(self, name):
        return re.sub(r'[^\w\s-]', '', name).strip()

    def validate_avatar(self, avatar):
        max_size = 1024 * 1024  # 1 MB
        allowed_types = ['image/jpeg', 'image/png', 'image/jpg']
        allowed_extensions = ['jpg', 'jpeg', 'png']

        if avatar.size > max_size:
            raise serializers.ValidationError('La taille du fichier de l\'avatar est trop grande. La taille maximale est de 1 Mo.')

        if avatar.content_type not in allowed_types:
            raise serializers.ValidationError('Type de fichier invalide. Seuls les fichiers JPEG et PNG sont autorisés.')

        validator = FileExtensionValidator(allowed_extensions=allowed_extensions)
        try:
            validator(avatar)
        except ValidationError:
            raise serializers.ValidationError('Extension de fichier invalide. Seules les extensions .jpg, .jpeg et .png sont autorisées.')

        return avatar

#-----------------------------------------FRIEND USERNAME DATA--------------------------------------# 

class FriendUsernameSerializer(serializers.Serializer):
    friend_username = serializers.CharField(max_length=150)

    def validate_friend_username(self, value):
        value = self.sanitize_username(value)
        
        if not re.match(r'^[\w.@+-]+$', value):
            raise serializers.ValidationError("Username contains invalid characters.")
        
        user = JwtUser.objects.filter(username=value).first()
        if not user:
            raise serializers.ValidationError("The specified user does not exist.")
        
        return value

    def sanitize_username(self, username):
        return username.strip()


class UsernameSerializer(serializers.Serializer):
    username = serializers.CharField(max_length=150)

    def validate_username(self, value):
        value = self.sanitize_username(value)
        
        if not re.match(r'^[\w.@+-]+$', value):
            raise serializers.ValidationError("Username contains invalid characters.")
        
        user = JwtUser.objects.filter(username=value).first()
        if not user:
            raise serializers.ValidationError("The specified user does not exist.")
        
        return value

    def sanitize_username(self, username):
        return username.strip()


#-----------------------------------------MESSAGE DATA--------------------------------------#

class MessageSerializer(serializers.ModelSerializer):
    author_username = serializers.CharField(source='author.username', read_only=True)
    recipient_username = serializers.CharField(source='recipient.username', read_only=True)

    class Meta:
        model = Message
        fields = ('id', 'author_username', 'recipient_username', 'content', 'timestamp')


class ChatMessagesSerializer(serializers.Serializer):
    message_amount = serializers.IntegerField(min_value=1, max_value=100)
    friend_username = serializers.CharField(max_length=150)
    start_id = serializers.IntegerField(required=False, allow_null=True)

    def validate_friend_username(self, value):
        value = self.sanitize_username(value)
        
        if not re.match(r'^[\w.@+-]+$', value):
            raise serializers.ValidationError("Username contains invalid characters.")
        
        user = JwtUser.objects.filter(username=value).first()
        if not user:
            raise serializers.ValidationError("The specified user does not exist.")
        
        return value

    def sanitize_username(self, username):
        return username.strip()


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

class GameHistoryCreateSerializer(serializers.Serializer):
    joueur1_username = serializers.CharField(write_only=True)
    joueur2_username = serializers.CharField(write_only=True, required=False, allow_null=True)
    is_ai_opponent = serializers.BooleanField(required=False, default=False)
    ai_opponent_name = serializers.CharField(required=False, allow_null=True, allow_blank=True)
    duree_partie = serializers.IntegerField(min_value=1, max_value=2147483647) 
    score_joueur1 = serializers.IntegerField(min_value=0)
    score_joueur2 = serializers.IntegerField(min_value=0)

    def validate(self, data):
        if data.get('is_ai_opponent') and not data.get('ai_opponent_name'):
            raise serializers.ValidationError("ai_opponent_name is required when is_ai_opponent is True")
        if not data.get('is_ai_opponent') and not data.get('joueur2_username'):
            raise serializers.ValidationError("joueur2_username is required when is_ai_opponent is False")
        return data

    def validate_joueur1_username(self, value):
        return self.validate_username(value, "Joueur 1")

    def validate_joueur2_username(self, value):
        if value is not None:
            return self.validate_username(value, "Joueur 2")
        return value

    def validate_username(self, value, player):
        value = self.sanitize_username(value)
        if not re.match(r'^[\w.@+-]+$', value):
            raise serializers.ValidationError(f"{player} username contains invalid characters.")
        user = JwtUser.objects.filter(username=value).first()
        if not user:
            raise serializers.ValidationError(f"{player} does not exist.")
        return value

    def sanitize_username(self, username):
        return username.strip()

    def validate_ai_opponent_name(self, value):
        if value:
            return value.strip()[:12]  # Limit to 12 characters
        return value

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
        return default_avatar

    def get_joueur2_avatar(self, obj):
        if obj.is_ai_opponent:
            return default_avatar
        elif obj.joueur2 and obj.joueur2.avatar:
            return obj.joueur2.avatar.url
        return default_avatar

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

