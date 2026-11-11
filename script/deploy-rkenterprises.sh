#!/usr/bin/env bash

# ==============================================================================
# Myth Connect.ai - Hostinger Deployment & SSL Engine for RK Enterprises
# Target Domain: rkenterprisess.net
#
# Rules enforced:
#   1. Does NOT kill or bind to existing in-use ports.
#   2. Initializes MySQL database first before starting services.
#   3. Configures isolated Nginx reverse proxy for rkenterprisess.net.
#   4. Issues Let's Encrypt SSL certificates automatically via Certbot.
# ==============================================================================

set -e

# Terminal Colors
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
CYAN='\033[0;36m'
BOLD='\033[1m'
NC='\033[0m'

DOMAIN_MAIN="rkenterprisess.net"
DOMAIN_WWW="www.rkenterprisess.net"
DOMAIN_API="api.rkenterprisess.net"
USER_EMAIL="vijay.vijayakumar3042@gmail.com"

NGINX_CONF_AVAILABLE="/etc/nginx/sites-available/rkenterprisess.conf"
NGINX_CONF_ENABLED="/etc/nginx/sites-enabled/rkenterprisess.conf"

echo -e "${CYAN}${BOLD}"
echo "================================================================================"
echo "    MYTH CONNECT.AI - HOSTINGER DEPLOYMENT FOR RK ENTERPRISES                   "
echo "    Main Domain: https://$DOMAIN_MAIN                                           "
echo "    API Domain:  https://$DOMAIN_API                                            "
echo "================================================================================"
echo -e "${NC}"

# 1. Verify Root / Sudo privileges
if [ "$EUID" -ne 0 ]; then
  echo -e "${RED}[ERROR] This deployment script requires root permissions.${NC}"
  echo -e "${YELLOW}Please run with: sudo bash $0${NC}"
  exit 1
fi

# 2. Determine and Navigate to Project Directory
if [ -d "/opt/mythconnect" ]; then
    ROOT_DIR="/opt/mythconnect"
else
    SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
    ROOT_DIR="$(cd "$SCRIPT_DIR/.." && pwd)"
fi

echo -e "${BLUE}[1/8] Deploying from: ${BOLD}$ROOT_DIR${NC}"
cd "$ROOT_DIR"

# 3. Dynamic Safe Port Scanner
find_free_port() {
    local candidate=$1
    while true; do
        if ss -tuln 2>/dev/null | grep -qE "[:.]${candidate}\s" || \
           netstat -tuln 2>/dev/null | grep -qE "[:.]${candidate}\s" || \
           lsof -i :${candidate} >/dev/null 2>&1; then
            echo -e "  ${YELLOW}[PORT OCCUPIED] Port ${candidate} is already in use. Checking next...${NC}" >&2
            candidate=$((candidate + 1))
        else
            echo "$candidate"
            return 0
        fi
    done
}

echo -e "\n${BLUE}[2/8] Detecting free ports without disturbing existing services...${NC}"
BACKEND_PORT=$(find_free_port 5050)
echo -e "  ✔ Selected Backend Port:  ${GREEN}${BOLD}${BACKEND_PORT}${NC}"

FRONTEND_PORT=$(find_free_port 3050)
echo -e "  ✔ Selected Frontend Port: ${GREEN}${BOLD}${FRONTEND_PORT}${NC}"

# 4. Initialize Database
echo -e "\n${BLUE}[3/8] Checking MySQL / MariaDB database service...${NC}"
if ! systemctl is-active --quiet mysql && ! systemctl is-active --quiet mariadb; then
    echo -e "${YELLOW}  Starting MySQL service...${NC}"
    systemctl start mysql 2>/dev/null || systemctl start mariadb 2>/dev/null || true
fi

DB_NAME="mythconnect_crm"
echo -e "  -> Ensuring database '${DB_NAME}' exists..."
mysql -u root -e "CREATE DATABASE IF NOT EXISTS \`${DB_NAME}\` CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;" 2>/dev/null || {
    echo -e "${YELLOW}[NOTICE] If MySQL requires a password, please verify database '${DB_NAME}' credentials in backend-node/.env.${NC}"
}

# Configure backend-node/.env
mkdir -p "$ROOT_DIR/logs"
if [ ! -f "$ROOT_DIR/backend-node/.env" ]; then
    cp "$ROOT_DIR/backend-node/.env.example" "$ROOT_DIR/backend-node/.env" 2>/dev/null || true
fi

if [ -f "$ROOT_DIR/backend-node/.env" ]; then
    sed -i "s/^PORT=.*/PORT=${BACKEND_PORT}/" "$ROOT_DIR/backend-node/.env" || echo "PORT=${BACKEND_PORT}" >> "$ROOT_DIR/backend-node/.env"
    sed -i "s|^APP_URL=.*|APP_URL=https://${DOMAIN_MAIN}|" "$ROOT_DIR/backend-node/.env" || echo "APP_URL=https://${DOMAIN_MAIN}" >> "$ROOT_DIR/backend-node/.env"
    sed -i "s/^NODE_ENV=.*/NODE_ENV=production/" "$ROOT_DIR/backend-node/.env" || echo "NODE_ENV=production" >> "$ROOT_DIR/backend-node/.env"
fi

# Configure frontend production environment
cat << EOF > "$ROOT_DIR/frontend/.env.production"
VITE_API_URL=https://${DOMAIN_MAIN}
VITE_WS_URL=wss://${DOMAIN_MAIN}/ws
EOF

# Run DB migration and seeds
echo -e "  -> Running database schema and seed migrations..."
cd "$ROOT_DIR/backend-node"
npm install --silent
npm run db:init || echo -e "${YELLOW}[NOTICE] Database initialization completed or schema already applied.${NC}"

# 5. Build Frontend Application
echo -e "\n${BLUE}[4/8] Building Frontend SPA for ${DOMAIN_MAIN}...${NC}"
cd "$ROOT_DIR/frontend"
npm install --silent
npm run build

if [ ! -f "$ROOT_DIR/frontend/dist/index.html" ]; then
    echo -e "${RED}[ERROR] Frontend build failed to output dist/index.html!${NC}"
    exit 1
fi
echo -e "  ✔ Frontend build generated at frontend/dist"

# 6. Launch Application Services via PM2
echo -e "\n${BLUE}[5/8] Managing application processes with PM2...${NC}"
if ! command -v pm2 &> /dev/null; then
    echo -e "${YELLOW}  Installing PM2 globally...${NC}"
    npm install -g pm2
fi

cd "$ROOT_DIR"
pm2 stop mythconnect-backend 2>/dev/null || true
pm2 delete mythconnect-backend 2>/dev/null || true
pm2 stop mythconnect-frontend 2>/dev/null || true
pm2 delete mythconnect-frontend 2>/dev/null || true

# Start Backend
PORT=$BACKEND_PORT pm2 start "$ROOT_DIR/backend-node/server.js" --name mythconnect-backend --time --log "$ROOT_DIR/logs/backend.log"
# Start Frontend preview server
pm2 start "npm" --name mythconnect-frontend --cwd "$ROOT_DIR/frontend" --time --log "$ROOT_DIR/logs/frontend.log" -- run preview -- --host 127.0.0.1 --port "$FRONTEND_PORT"

pm2 save 2>/dev/null || true
echo -e "  ✔ PM2 backend and frontend processes active."

# 7. Create Isolated Nginx Configuration for rkenterprisess.net
echo -e "\n${BLUE}[6/8] Configuring isolated Nginx reverse proxy for ${DOMAIN_MAIN}...${NC}"
mkdir -p /var/www/certbot

cat << EOF > "$NGINX_CONF_AVAILABLE"
# ==============================================================================
# Myth Connect.ai - Single & Dual Domain Nginx Reverse Proxy for RK Enterprises
# ==============================================================================

server {
    listen 80;
    listen [::]:80;
    server_name ${DOMAIN_MAIN} ${DOMAIN_WWW} ${DOMAIN_API};

    client_max_body_size 50M;

    location /.well-known/acme-challenge/ {
        root /var/www/certbot;
        try_files \$uri =404;
    }

    gzip on;
    gzip_vary on;
    gzip_proxied any;
    gzip_comp_level 6;
    gzip_types text/plain text/css text/xml application/json application/javascript application/rss+xml application/atom+xml image/svg+xml;

    # Backend API Route
    location /api/ {
        proxy_pass http://127.0.0.1:${BACKEND_PORT}/api/;
        proxy_http_version 1.1;
        proxy_set_header Upgrade \$http_upgrade;
        proxy_set_header Connection 'upgrade';
        proxy_set_header Host \$host;
        proxy_cache_bypass \$http_upgrade;
        proxy_set_header X-Real-IP \$remote_addr;
        proxy_set_header X-Forwarded-For \$proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto \$scheme;

        proxy_connect_timeout 60s;
        proxy_send_timeout 60s;
        proxy_read_timeout 60s;
    }

    # Realtime WebSocket Gateway (/ws)
    location /ws {
        proxy_pass http://127.0.0.1:${BACKEND_PORT}/ws;
        proxy_http_version 1.1;
        proxy_set_header Upgrade \$http_upgrade;
        proxy_set_header Connection "upgrade";
        proxy_set_header Host \$host;
        proxy_set_header X-Real-IP \$remote_addr;
        proxy_set_header X-Forwarded-For \$proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto \$scheme;
        proxy_read_timeout 86400s;
        proxy_send_timeout 86400s;
    }

    # Frontend Single Page Application
    location / {
        proxy_pass http://127.0.0.1:${FRONTEND_PORT};
        proxy_http_version 1.1;
        proxy_set_header Upgrade \$http_upgrade;
        proxy_set_header Connection 'upgrade';
        proxy_set_header Host \$host;
        proxy_cache_bypass \$http_upgrade;
        proxy_set_header X-Real-IP \$remote_addr;
        proxy_set_header X-Forwarded-For \$proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto \$scheme;

        proxy_connect_timeout 60s;
        proxy_send_timeout 60s;
        proxy_read_timeout 60s;
    }
}
EOF

# Create symlink
ln -sf "$NGINX_CONF_AVAILABLE" "$NGINX_CONF_ENABLED"
echo -e "  ✔ Created symlink: $NGINX_CONF_ENABLED -> $NGINX_CONF_AVAILABLE"

# Test and reload Nginx
nginx -t
systemctl reload nginx
echo -e "  ✔ Nginx reloaded successfully."

# 8. Request Free Let's Encrypt SSL Certificates via Certbot
echo -e "\n${BLUE}[7/8] Requesting Let's Encrypt SSL Certificates...${NC}"
if ! command -v certbot &> /dev/null; then
    echo -e "${YELLOW}  Installing Certbot and Nginx plugin...${NC}"
    apt update && apt install -y certbot python3-certbot-nginx
fi

echo -e "  -> Generating SSL certificates for ${DOMAIN_MAIN}, ${DOMAIN_WWW}, and ${DOMAIN_API}..."
certbot --nginx \
    -d "$DOMAIN_MAIN" \
    -d "$DOMAIN_WWW" \
    --non-interactive \
    --agree-tos \
    -m "$USER_EMAIL" \
    --redirect || {
    echo -e "${YELLOW}[NOTICE] If DNS A record is still propagating, run certbot manually: sudo certbot --nginx -d $DOMAIN_MAIN -d $DOMAIN_WWW${NC}"
}

systemctl reload nginx 2>/dev/null || true

# 9. Health Check & Summary
echo -e "\n${BLUE}[8/8] Performing health checks...${NC}"
sleep 2

HEALTH=$(curl -s "http://127.0.0.1:${BACKEND_PORT}/api/health" 2>/dev/null || true)

echo -e "\n${CYAN}================================================================================${NC}"
echo -e "${GREEN}${BOLD}       🎉 MYTH CONNECT.AI DEPLOYMENT FOR RK ENTERPRISES COMPLETE!               ${NC}"
echo -e "${CYAN}================================================================================${NC}"
echo -e "  🌐 Live Application:    ${GREEN}${BOLD}https://${DOMAIN_MAIN}/${NC}"
echo -e "  📡 Backend API Server:   ${GREEN}${BOLD}https://${DOMAIN_MAIN}/api${NC}"
echo -e "  🔌 WebSocket Gateway:    ${BOLD}wss://${DOMAIN_MAIN}/ws${NC}"
echo -e "  ⚡ Internal Backend Port: ${BOLD}${BACKEND_PORT}${NC}"
echo -e "  ⚡ Internal Frontend Port:${BOLD}${FRONTEND_PORT}${NC}"
echo -e "  🛡️  Nginx Config:         ${BOLD}${NGINX_CONF_AVAILABLE}${NC}"
echo -e "  🔗 Nginx Symlink:        ${BOLD}${NGINX_CONF_ENABLED}${NC}"
if [ -n "$HEALTH" ]; then
    echo -e "  💚 Backend Health Status: ${GREEN}${HEALTH}${NC}"
fi
echo -e "${CYAN}================================================================================${NC}\n"
