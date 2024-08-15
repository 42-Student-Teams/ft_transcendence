#!/usr/bin/env bash
python manage.py makemigrations
python manage.py migrate
python manage.py collectstatic --noinput

cd /app

cp ./files/default_avatar.png /staticfiles

python3 manage.py runserver 0.0.0.0:8069
# daphne -b 0.0.0.0 -p 8000 backend.asgi:application
