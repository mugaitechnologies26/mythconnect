#!/usr/bin/env bash

# ==============================================================================
# Myth Connect.ai - Automated Nginx & Free Let's Encrypt SSL Setup
# Domain: mythconnect.mugaitechnologies.in
# ==============================================================================

set -e

DOMAIN="mythconnect.mugaitechnologies.in"
CONF_SOURCE="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)/nginx-mythconnect.conf"
NGINX_AVAILABLE="/etc/nginx/sites-available/$DOMAIN"
NGINX_ENABLED="/etc/nginx/sites-enabled/$DOMAIN"

if [ "$EUID" -ne 0 ]; then
  echo "Please run as root or with sudo: sudo bash script/setup-ssl.sh"
  exit 1
fi

echo "================================================================================"
echo " Setting up Nginx Reverse Proxy & SSL for: $DOMAIN"
echo "================================================================================"

# 1. Ensure Nginx and Certbot are installed
echo "-> Checking Nginx and Certbot installation..."
if ! command -v nginx &> /dev/null; then
    apt update && apt install -y nginx
fi

if ! command -v certbot &> /dev/null; then
    apt update && apt install -y certbot python3-certbot-nginx
fi

# 2. Deploy temporary HTTP-only config if SSL certs do not exist yet
if [ ! -d "/etc/letsencrypt/live/$DOMAIN" ]; then
    echo "-> Generating temporary HTTP configuration for Initial Certbot Verification..."
    cat << EOF > "$NGINX_AVAILABLE"
server {
    listen 80;
    listen [::]:80;
    server_name $DOMAIN;

    location / {
        proxy_pass http://127.0.0.1:5000;
        proxy_http_version 1.1;
        proxy_set_header Upgrade \$http_upgrade;
        proxy_set_header Connection 'upgrade';
        proxy_set_header Host \$host;
    }
}
EOF
    ln -sf "$NGINX_AVAILABLE" "$NGINX_ENABLED"
    nginx -t
    systemctl reload nginx

    echo "-> Requesting Let's Encrypt SSL certificate for $DOMAIN..."
    certbot --nginx -d "$DOMAIN" --non-interactive --agree-tos --register-unsafely-without-email || {
        echo "Please run certbot interactively:"
        certbot --nginx -d "$DOMAIN"
    }
fi

# 3. Apply full production Nginx configuration with SSL & WebSocket support
echo "-> Installing production Nginx configuration..."
cp "$CONF_SOURCE" "$NGINX_AVAILABLE"
ln -sf "$NGINX_AVAILABLE" "$NGINX_ENABLED"

nginx -t
systemctl reload nginx

echo "================================================================================"
echo "  SSL & NGINX PROXY SETUP COMPLETE!"
echo "  Live Domain: https://$DOMAIN"
echo "================================================================================"
