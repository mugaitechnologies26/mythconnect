#!/usr/bin/env bash

# ==============================================================================
# Myth Connect.ai - Hostinger Web/Cloud Hosting Auto-Deployer
# Domain: rkenterprisess.net
# User:   u395270878
# ==============================================================================

set -e

# Terminal Colors
GREEN='\033[0;32m'
BLUE='\033[0;34m'
YELLOW='\033[1;33m'
RED='\033[0;31m'
CYAN='\033[0;36m'
BOLD='\033[1m'
NC='\033[0m'

echo -e "${CYAN}${BOLD}"
echo "================================================================================"
echo "    MYTH CONNECT.AI - DEPLOYMENT ON HOSTINGER FOR RKENTERPRISESS.NET            "
echo "================================================================================"
echo -e "${NC}"

HOME_DIR="${HOME:-/home/u395270878}"
PROJECT_DIR="$HOME_DIR/mythconnect"
WEB_ROOT="$HOME_DIR/domains/rkenterprisess.net/public_html"

if [ ! -d "$WEB_ROOT" ]; then
    WEB_ROOT="$HOME_DIR/public_html"
fi

DB_USER="u395270878_admin"
DB_PASS="Ajay@2001and2025"
DB_NAME="u395270878_crm"
DB_HOST="localhost"
APP_PORT="5050"

echo -e "${BLUE}[1/6] Setting up project directory at ${PROJECT_DIR}...${NC}"
if [ -d "$PROJECT_DIR" ]; then
    cd "$PROJECT_DIR"
    git fetch origin main
    git reset --hard origin/main
else
    git clone https://github.com/mugaitechnologies26/mythconnect.git "$PROJECT_DIR"
    cd "$PROJECT_DIR"
fi

echo -e "\n${BLUE}[2/6] Initializing MySQL Database (${DB_NAME})...${NC}"
# Test connection with full name, fallback to short name if needed
if ! mysql -h "$DB_HOST" -u "$DB_USER" -p"$DB_PASS" -e "USE \`$DB_NAME\`;" 2>/dev/null; then
    DB_USER="admin"
    DB_NAME="crm"
fi

echo -e "  -> Importing database schema..."
mysql -h "$DB_HOST" -u "$DB_USER" -p"$DB_PASS" "$DB_NAME" < "$PROJECT_DIR/database/schema.sql" || true

echo -e "  -> Importing initial database seeds..."
mysql -h "$DB_HOST" -u "$DB_USER" -p"$DB_PASS" "$DB_NAME" < "$PROJECT_DIR/database/seeds.sql" || true
echo -e "  ${GREEN}✔ Database setup complete.${NC}"

echo -e "\n${BLUE}[3/6] Configuring Backend Environment...${NC}"
cat << EOF > "$PROJECT_DIR/backend-node/.env"
PORT=${APP_PORT}
NODE_ENV=production
APP_URL=https://rkenterprisess.net
DB_HOST=${DB_HOST}
DB_PORT=3306
DB_USER=${DB_USER}
DB_PASSWORD=${DB_PASS}
DB_NAME=${DB_NAME}
JWT_SECRET=mythconnect_rkenterprisess_secure_jwt_2026
CORS_ORIGIN=*
EOF

echo -e "\n${BLUE}[4/6] Installing dependencies and building frontend...${NC}"
cd "$PROJECT_DIR/backend-node"
npm install --silent

cd "$PROJECT_DIR/frontend"
cat << EOF > "$PROJECT_DIR/frontend/.env.production"
VITE_API_URL=https://rkenterprisess.net
VITE_WS_URL=wss://rkenterprisess.net/ws
EOF
npm install --silent
npm run build

echo -e "\n${BLUE}[5/6] Publishing Frontend to Web Root (${WEB_ROOT})...${NC}"
mkdir -p "$WEB_ROOT"
cp -r "$PROJECT_DIR/frontend/dist/"* "$WEB_ROOT/"

# Generate .htaccess for LiteSpeed / Apache reverse proxy
cat << 'EOF' > "$WEB_ROOT/.htaccess"
RewriteEngine On
RewriteBase /

# 1. Reverse Proxy API requests to Node.js backend
RewriteRule ^api/(.*)$ http://127.0.0.1:5050/api/$1 [P,L]

# 2. Reverse Proxy WebSocket gateway
RewriteCond %{HTTP:Upgrade} websocket [NC]
RewriteCond %{HTTP:Connection} upgrade [NC]
RewriteRule ^ws(.*)$ ws://127.0.0.1:5050/ws$1 [P,L]

# 3. Single Page Application (SPA) routing fallback
RewriteCond %{REQUEST_FILENAME} !-f
RewriteCond %{REQUEST_FILENAME} !-d
RewriteRule ^ index.html [L]
EOF

echo -e "  ${GREEN}✔ Frontend deployed to public_html with .htaccess reverse proxy.${NC}"

echo -e "\n${BLUE}[6/6] Starting Backend Service...${NC}"
cd "$PROJECT_DIR"
if command -v pm2 &> /dev/null; then
    pm2 stop mythconnect-api 2>/dev/null || true
    pm2 delete mythconnect-api 2>/dev/null || true
    PORT=$APP_PORT pm2 start "$PROJECT_DIR/backend-node/server.js" --name mythconnect-api
    pm2 save 2>/dev/null || true
else
    # Fallback to nohup if PM2 is not installed
    pkill -f "backend-node/server.js" 2>/dev/null || true
    nohup node "$PROJECT_DIR/backend-node/server.js" > "$PROJECT_DIR/backend.log" 2>&1 &
fi

# Ensure process auto-restarts via crontab
(crontab -l 2>/dev/null | grep -v "server.js" ; echo "@reboot cd $PROJECT_DIR && node backend-node/server.js >> backend.log 2>&1 &") | crontab - 2>/dev/null || true

echo -e "\n${CYAN}================================================================================${NC}"
echo -e "${GREEN}${BOLD}    🎉 DEPLOYMENT SUCCESSFUL ON RKENTERPRISESS.NET!                            ${NC}"
echo -e "${CYAN}================================================================================${NC}"
echo -e "  🌐 Website: https://rkenterprisess.net"
echo -e "  📡 API:     https://rkenterprisess.net/api"
echo -e "  🔌 WS:      wss://rkenterprisess.net/ws"
echo -e "${CYAN}================================================================================${NC}\n"
