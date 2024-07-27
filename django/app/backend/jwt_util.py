import datetime
import os

import jwt

from django.conf import settings
from .models import JwtUser
from .util import date_to_timestamp


# we potentially need to check if the user still exists, even if a valid payload can be extracted
# we also probably don't want to use jwt for things like sending game data, frequency too high
# on refresh tokens: https://stackoverflow.com/a/69631673
def check_payload_jwt(payload, skip_user_exists_check=False):
    if not 'jwt' in payload:
        return False
    payload_data = None
    try:
        payload_data = jwt.decode(payload['jwt'], os.getenv('SECRET_KEY'), algorithms=['HS256'])
        if not skip_user_exists_check:
            if 'username' not in payload_data:
                return False
            if JwtUser.objects.get(username=payload['username']) is None:
                return False
        return True
    except Exception as e:
        return False
    return False

# Warning! This function does not validate a jwt token!
def get_jwt_username(payload):
    if not 'jwt' in payload:
        return None
    payload_data = None
    try:
        payload_data = jwt.decode(payload['jwt'], os.getenv('SECRET_KEY'), algorithms=['HS256'])
        if 'username' not in payload_data:
            return payload_data['username']
        return True
    except Exception as e:
        return None
    return None

# note: we only need username and expires
def gen_jwt(username):
    payload = {
        'username': username,
        'expires': date_to_timestamp(datetime.datetime.now(datetime.timezone.utc) + datetime.timedelta(
            minutes=settings.TOKEN_EXPIRATION_MINUTES)),
    }
    return jwt.encode(payload, os.getenv('JWT_SECRET'), algorithm='HS256')