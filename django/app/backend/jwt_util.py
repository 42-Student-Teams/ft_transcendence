import datetime
import os

import jwt
from rest_framework.exceptions import AuthenticationFailed
from rest_framework.response import Response

from django.conf import settings
from .models import JwtUser
from .util import date_to_timestamp


# we potentially need to check if the user still exists, even if a valid payload can be extracted
# we also probably don't want to use jwt for things like sending game data, frequency too high
# on refresh tokens: https://stackoverflow.com/a/69631673
def check_jwt(request, skip_user_exists_check=False):
    auth_header = request.headers.get('Authorization')
    if not auth_header:
        raise AuthenticationFailed('Unauthenticated')
    if len(auth_header) < 2:
        raise AuthenticationFailed('Unauthenticated')
    try:
        token = auth_header.split()[1]
        payload = jwt.decode(token, settings.JWT_SECRET, algorithms=['HS256'])
    except jwt.ExpiredSignatureError:
        raise AuthenticationFailed('Token expired')
    except (IndexError, jwt.DecodeError):
        raise AuthenticationFailed('Invalid token')

    # je crois que l'exception n'est pas raised avec un simple objects.get
    '''try:
        user = JwtUser.objects.filter(username=payload['username']).first()
    except JwtUser.DoesNotExist:
        raise AuthenticationFailed('User not found')'''

    if not skip_user_exists_check:
        if 'username' not in payload:
            raise AuthenticationFailed('Missing username')
        if JwtUser.objects.filter(username=payload.get('username')).first() is None:
            raise AuthenticationFailed('User not found')
    return payload.get('username')

# note: we only need username and expires
def gen_jwt(username):
    payload = {
        'username': username,
        'expires': date_to_timestamp(datetime.datetime.now(datetime.timezone.utc) + datetime.timedelta(
            minutes=settings.TOKEN_EXPIRATION_MINUTES)),
    }
    return jwt.encode(payload, os.getenv('JWT_SECRET'), algorithm='HS256')

def jwt_response(username):
    return Response(data={'jwt': gen_jwt(username)})
