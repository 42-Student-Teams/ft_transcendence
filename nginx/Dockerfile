FROM alpine:3.20.0

RUN apk add openssl

RUN mkdir -p /etc/nginx/ssl
RUN openssl req -x509 -nodes \
        -out /etc/nginx/ssl/nginx-certificate.crt \
        -keyout /etc/nginx/ssl/nginx-certificate.key \
        -subj "/C=CH/ST=Vaud/L=Lausanne/O=42/OU=42/CN=*42pong.ch/UID=lsaba-qu"

RUN mkdir -p /etc/nginx/sites-enabled

COPY data/nginx.conf /etc/nginx/
COPY data/proxy_params /etc/nginx/
ADD data/snippets /etc/nginx/snippets/

COPY data/sites-enabled/* /etc/nginx/sites-enabled/api

RUN apk add nginx

CMD ["nginx", "-c", "/etc/nginx/nginx.conf", "-g", "daemon off;"]
