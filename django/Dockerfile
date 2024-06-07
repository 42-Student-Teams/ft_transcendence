FROM alpine:3.20.0

ARG USER=appuser

RUN adduser -D $USER

COPY ./requirements.txt /

RUN apk add --no-cache postgresql-libs python3 py3-pip

# Thanks to --virtual .build-deps we can yank all deps at the end
RUN \
	apk add --no-cache --virtual .build-deps gcc musl-dev postgresql-dev && \
	pip3 install -r requirements.txt --no-cache-dir --break-system-packages && \
	apk --purge del .build-deps


RUN mkdir /app
WORKDIR /app
#COPY ./app/requirements.txt /app

# For now we mount it
# COPY . /app

USER $USER

CMD ["python3", "manage.py", "runserver", "0.0.0.0:8000"]

#CMD ["sleep", "infinity"]
