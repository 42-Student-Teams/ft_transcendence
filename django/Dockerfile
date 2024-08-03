FROM alpine:3.20.0

# ARG USER=appuser

# RUN adduser -D $USER

COPY ./requirements.txt /

RUN apk add --no-cache postgresql-libs python3 py3-pip

# for arm64 For (m1,  m2, etc...)
#RUN apk add libffi-dev python-dev  

# Thanks to --virtual .build-deps we can yank all deps at the end
RUN \
	apk add --no-cache --virtual .build-deps python3-dev libffi-dev gcc musl-dev postgresql-dev && \
	pip3 install -r requirements.txt --no-cache-dir --break-system-packages && \
	apk --purge del .build-deps

RUN mkdir /staticfiles
COPY ./files/default_avatar.png /staticfiles

RUN mkdir /app
WORKDIR /app
#COPY ./app/requirements.txt /app

# For now we mount it
# COPY . /app

EXPOSE 8000

# COPY ./entrypoint.sh /tmp/entrypoint.sh
# RUN chmod +x /tmp/entrypoint.sh
# ENTRYPOINT [ "sh" , "/tmp/entrypoint.sh"]
USER $USER

CMD ["python3", "manage.py", "runserver", "0.0.0.0:8000"]
#CMD ["python", "-m", "uvicorn", "--reload", "--host", "0.0.0.0", "app.asgi:application"]


#CMD ["sleep", "infinity"]
