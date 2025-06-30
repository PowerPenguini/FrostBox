#!/bin/sh

set -e

echo "🔄 Waiting for nginx to start..."
sleep 10

STAGING_FLAG=""
if [ "$LETSENCRYPT_STAGING" = "1" ]; then
  echo "🌱 Using Let's Encrypt STAGING environment"
  STAGING_FLAG="--staging"
else
  echo "🚀 Using Let's Encrypt PRODUCTION environment"
fi

CERT_PATH="/etc/letsencrypt/live/$DOMAIN_NAME/fullchain.pem"

if [ ! -f "$CERT_PATH" ]; then
  echo "🔐 Requesting initial certificate for $DOMAIN_NAME..."
  certbot certonly $STAGING_FLAG --webroot -w /var/www/certbot \
    --email "$EMAIL" \
    --agree-tos \
    --no-eff-email \
    -d "$DOMAIN_NAME"
else
  echo "✅ Certificate already exists, skipping initial request."
fi

echo "🔁 Starting certificate renewal loop..."
while true; do
  certbot renew --webroot -w /var/www/certbot
  sleep 12h
done
