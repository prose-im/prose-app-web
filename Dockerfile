FROM nginx:1.27-alpine-slim as web

RUN rm -rf /etc/nginx/ /var/www/

COPY ./env/nginx /etc/nginx/
COPY ./dist /var/www/

EXPOSE 8080/tcp
