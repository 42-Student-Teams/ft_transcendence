FROM nginx:1.27.0-alpine
#COPY --from=builder /app/dist/ /usr/share/nginx/html

RUN apk add openssl
RUN mkdir -p /etc/data/ssl
RUN openssl req -x509 -nodes \
        -out /etc/data/ssl/data-certificate.crt \
        -keyout /etc/data/ssl/data-certificate.key \
        -subj "/C=CH/ST=Vaud/L=Lausanne/O=42/OU=42/CN=*42pong.ch/UID=lsaba-qu"
