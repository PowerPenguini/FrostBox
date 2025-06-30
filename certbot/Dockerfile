FROM certbot/certbot

COPY init.sh /init.sh
RUN chmod +x /init.sh

ENTRYPOINT ["/init.sh"]