ARG BACKEND_IP

FROM alpine:3.20.0

ARG BACKEND_IP

RUN echo ${BACKEND_IP} > bruh.txt

RUN echo ${BACKEND_IP} > bruh2.txt

RUN apk add openssl

RUN mkdir -p /etc/nginx/ssl
RUN openssl req -x509 -nodes \
        -out /etc/nginx/ssl/nginx-certificate.crt \
        -keyout /etc/nginx/ssl/nginx-certificate.key \
        -subj "/C=CH/ST=Vaud/L=Lausanne/O=42/OU=42/CN=${BACKEND_IP}/UID=lsaba-qu"

RUN mkdir -p /etc/nginx/sites-enabled
RUN mkdir -p /var/www/backend/staticfiles/

COPY data/nginx.conf /etc/nginx/
COPY data/proxy_params /etc/nginx/
ADD data/snippets /etc/nginx/snippets/

COPY data/sites-enabled/* /etc/nginx/sites-enabled/

#RUN sed BACKEND_IP for the env var
RUN for file in /etc/nginx/sites-enabled/*; do \
        sed -i "s/\%BACKEND_IP%/${BACKEND_IP}/g" "$file"; \
    done

RUN apk add nginx

CMD ["nginx", "-c", "/etc/nginx/nginx.conf", "-g", "daemon off;"]
