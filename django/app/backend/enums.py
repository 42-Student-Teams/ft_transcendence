from enum import Enum


class AuthLevel(Enum):
    NOAUTH = 1
    AUTH = 2
    ADMIN = 3

class TokenValidationResponse(Enum):
    VALID = 1
    INVALID = 2
    EXPIRED = 3
    MISSING_PERMS = 4