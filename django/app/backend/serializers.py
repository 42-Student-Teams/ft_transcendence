from rest_framework import serializers

from .models import JwtUser, Message, GameHistory


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


class GameHistorySerializer(serializers.ModelSerializer):
    joueur1_username = serializers.CharField(source='joueur1.username', read_only=True)
    joueur2_username = serializers.CharField(source='joueur2.username', read_only=True)
    gagnant_username = serializers.CharField(source='gagnant.username', read_only=True)

    class Meta:
        model = GameHistory
        fields = ('id', 'date_partie', 'joueur1_username', 'joueur2_username', 'duree_partie', 'score_joueur1', 'score_joueur2', 'gagnant_username')


class GameHistoryCreateSerializer(serializers.ModelSerializer):
    joueur1_username = serializers.CharField(write_only=True)
    joueur2_username = serializers.CharField(write_only=True)

    class Meta:
        model = GameHistory
        fields = ('joueur1_username', 'joueur2_username', 'duree_partie', 'score_joueur1', 'score_joueur2')

    def create(self, validated_data):
        joueur1 = JwtUser.objects.get(username=validated_data.pop('joueur1_username'))
        joueur2 = JwtUser.objects.get(username=validated_data.pop('joueur2_username'))
        return GameHistory.objects.create(joueur1=joueur1, joueur2=joueur2, **validated_data)