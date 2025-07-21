FROM nginx:alpine

WORKDIR /etc/nginx

COPY http.conf.template /etc/nginx/http.conf.template
COPY https.conf.template /etc/nginx/https.conf.template
COPY reload.sh /reload.sh

RUN chmod +x /reload.sh

EXPOSE 80

CMD ["/reload.sh"]
