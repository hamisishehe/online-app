FROM nginx:1.27-alpine

RUN apk add --no-cache openssl

COPY default.conf /etc/nginx/conf.d/default.conf
COPY docker-entrypoint.sh /docker-entrypoint-nginx.sh

RUN chmod +x /docker-entrypoint-nginx.sh

ENTRYPOINT ["/docker-entrypoint-nginx.sh"]
