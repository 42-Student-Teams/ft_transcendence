"""
Django settings for app project.

Generated by 'django-admin startproject' using Django 5.0.6.

For more information on this file, see
https://docs.djangoproject.com/en/5.0/topics/settings/

For the full list of settings and their values, see
https://docs.djangoproject.com/en/5.0/ref/settings/
"""

import os
from pathlib import Path
from django.conf import settings

# Build paths inside the project like this: BASE_DIR / 'subdir'.
BASE_DIR = Path(__file__).resolve().parent.parent


# DEFAULT_AVATAR_PATH = os.path.join(BASE_DIR, 'files', 'default_avatar.png')

# avatar_dir = os.path.join(settings.MEDIA_ROOT, 'avatars')
# print(f"Le chemin du dossier avatars est : {avatar_dir}")

# print(f"Le dossier existe : {os.path.exists(avatar_dir)}")

# if os.path.exists(avatar_dir):
#     print("Fichiers dans le dossier avatars :")
#     for file in os.listdir(avatar_dir):
#         print(file)


# Quick-start development settings - unsuitable for production
# See https://docs.djangoproject.com/en/5.0/howto/deployment/checklist/

# SECURITY WARNING: keep the secret key used in production secret!
SECRET_KEY = 'django-insecure-9&ys+#0$ffoz189_)^55m7h8pxj1_c=!q@%-$34ws4g(m+!#ov'

# SECURITY WARNING: don't run with debug turned on in production!
debug_val = os.getenv('DJANGO_DEBUG')
if debug_val is None:
    debug_val = True
if debug_val == 'true':
    debug_val = True
DEBUG = debug_val

CORS_ALLOW_ALL_ORIGINS = False

ALLOWED_HOSTS = [
    'localhost',
    os.getenv('BACKEND_IP', '0.0.0.0'),
    'pong.ch',
]

JWT_SECRET = os.getenv('JWT_SECRET')


# Application definition

INSTALLED_APPS = [
    'daphne',
    'django.contrib.admin',
    'django.contrib.auth',
    'django.contrib.contenttypes',
    'django.contrib.sessions',
    'django.contrib.messages',
    'django.contrib.staticfiles',
    'backend',
    'corsheaders',
    'rest_framework',
]

MIDDLEWARE = [
    'django.middleware.security.SecurityMiddleware',
    'django.contrib.sessions.middleware.SessionMiddleware',
    'django.middleware.common.CommonMiddleware',
    'corsheaders.middleware.CorsMiddleware',
    #'django.middleware.csrf.CsrfViewMiddleware',
    'django.contrib.auth.middleware.AuthenticationMiddleware',
    'django.contrib.messages.middleware.MessageMiddleware',
    'django.middleware.clickjacking.XFrameOptionsMiddleware',
]

ROOT_URLCONF = 'app.urls'

CORS_ALLOWED_ORIGINS = [
    "http://127.0.0.1:8000",
]

TEMPLATES = [
    {
        'BACKEND': 'django.template.backends.django.DjangoTemplates',
        'DIRS': [],
        'APP_DIRS': True,
        'OPTIONS': {
            'context_processors': [
                'django.template.context_processors.debug',
                'django.template.context_processors.request',
                'django.contrib.auth.context_processors.auth',
                'django.contrib.messages.context_processors.messages',
            ],
        },
    },
]

#WSGI_APPLICATION = 'app.wsgi.application'
ASGI_APPLICATION = 'app.asgi.application'
#ASGI_APPLICATION = 'app.routing.application'

# Database
# https://docs.djangoproject.com/en/5.0/ref/settings/#databases

DATABASES = {
    "default": {
        "ENGINE": "django.db.backends.postgresql",
        "NAME": os.getenv('POSTGRES_DB'),
        "USER": os.getenv('POSTGRES_USER'),
        "PASSWORD": os.getenv('POSTGRES_PASSWORD'),
        "HOST": os.getenv('DB_HOST'),
        "PORT": os.getenv('DB_PORT'),
    }
}


# Password validation
# https://docs.djangoproject.com/en/5.0/ref/settings/#auth-password-validators

AUTH_PASSWORD_VALIDATORS = [
    {
        'NAME': 'django.contrib.auth.password_validation.UserAttributeSimilarityValidator',
    },
    {
        'NAME': 'django.contrib.auth.password_validation.MinimumLengthValidator',
    },
    {
        'NAME': 'django.contrib.auth.password_validation.CommonPasswordValidator',
    },
    {
        'NAME': 'django.contrib.auth.password_validation.NumericPasswordValidator',
    },
]


# Internationalization
# https://docs.djangoproject.com/en/5.0/topics/i18n/

LANGUAGE_CODE = 'en-us'

TIME_ZONE = 'Europe/Zurich'

USE_I18N = True

USE_TZ = True




# Static files (CSS, JavaScript, Images)
# https://docs.djangoproject.com/en/5.0/howto/static-files/

STATIC_ROOT = os.path.join(BASE_DIR, 'staticfiles')
STATIC_URL = 'static/'

MEDIA_URL = ""
MEDIA_ROOT = os.path.join(BASE_DIR, "")




# Chemin vers le dossier contenant l'avatar par défaut
# DEFAULT_AVATAR_PATH = os.path.join(BASE_DIR, 'files', 'default_avatar.png')

# Default primary key field type
# https://docs.djangoproject.com/en/5.0/ref/settings/#default-auto-field

DEFAULT_AUTO_FIELD = 'django.db.models.BigAutoField'

'''REST_FRAMEWORK = {
    'DEFAULT_PERMISSION_CLASSES': [
        'rest_framework.permissions.AllowAny',
    ],
    'DEFAULT_AUTHENTICATION_CLASSES': [
        'rest_framework.authentication.BasicAuthentication',
    ],
}'''

CHANNEL_LAYERS = {
    'default': {
        'BACKEND': 'channels.layers.InMemoryChannelLayer',
    },
}


TOKEN_EXPIRATION_MINUTES:int = int(os.getenv("TOKEN_EXPIRATION_MINUTES", 15))


AUTH_USER_MODEL = 'backend.jwtuser'

MAX_TOURNAMENT_PLAYERS = 4
if MAX_TOURNAMENT_PLAYERS < 2:
    MAX_TOURNAMENT_PLAYERS = 2

MAX_NAME_LENGTH = 30