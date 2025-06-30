#!/bin/sh
set -e

CONFIG_HTTP="/etc/nginx/http.conf.template"
CONFIG_HTTPS="/etc/nginx/https.conf.template"
TARGET_CONF="/etc/nginx/nginx.conf"
CERT_PATH="/etc/letsencrypt/live/${DOMAIN_NAME}/fullchain.pem"

if [ -f "$CERT_PATH" ]; then
  echo "✅ Cert exists, using HTTPS config"
  envsubst '${DOMAIN_NAME}' < "$CONFIG_HTTPS" > "$TARGET_CONF"
else
  echo "⚠️  No cert yet, using temporary HTTP config"
  envsubst '${DOMAIN_NAME}' < "$CONFIG_HTTP" > "$TARGET_CONF"
fi

(
  while :; do
    sleep 6h
    nginx -t && nginx -s reload
  done
) &

(
  while [ ! -f "$CERT_PATH" ]; do
    echo "⏳ Waiting for certificate..."
    sleep 10
  done
  echo "🎉 Certificate detected! Switching to HTTPS config"
  envsubst '${DOMAIN_NAME}' < "$CONFIG_HTTPS" > "$TARGET_CONF"
  nginx -t && nginx -s reload
) &

# Start Nginxa
exec nginx -g 'daemon off;'
