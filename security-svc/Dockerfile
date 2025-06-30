FROM alpine:latest

RUN apk add --no-cache openssl

WORKDIR /app
COPY generate.sh /app/generate.sh
RUN chmod +x /app/generate.sh

ENTRYPOINT ["/app/generate.sh"]