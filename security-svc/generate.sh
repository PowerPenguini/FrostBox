#!/bin/sh
set -e

echo "🔑 Generating JWT ES256 key pair..."

openssl ecparam -genkey -name prime256v1 -noout -out "/secrets/jwt-private.pem"

openssl ec -in "/secrets/jwt-private.pem" -pubout -out "/secrets/jwt-public.pem"

echo "✅ Keys generated in /secrets"
