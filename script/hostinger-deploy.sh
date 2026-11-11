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
APP_PORT="39527"

# ------------------------------------------------------------------------------
# 0. Ensure Node.js and NPM are available (Hostinger CloudLinux or NVM)
# ------------------------------------------------------------------------------
echo -e "${BLUE}[0/6] Detecting Node.js runtime environment...${NC}"
for alt_path in /opt/alt/alt-nodejs20/root/usr/bin /opt/alt/alt-nodejs18/root/usr/bin /usr/local/bin /usr/bin; do
    if [ -f "$alt_path/node" ]; then
        export PATH="$alt_path:$PATH"
        break
    fi
done

export NVM_DIR="$HOME/.nvm"
if [ -s "$NVM_DIR/nvm.sh" ]; then
    \. "$NVM_DIR/nvm.sh"
fi

if ! command -v node &> /dev/null || ! command -v npm &> /dev/null; then
    echo -e "${YELLOW}  Node.js/npm not in PATH. Installing Node.js v20 via NVM in user home...${NC}"
    curl -o- https://raw.githubusercontent.com/nvm-sh/nvm/v0.39.7/install.sh | bash
    export NVM_DIR="$HOME/.nvm"
    [ -s "$NVM_DIR/nvm.sh" ] && \. "$NVM_DIR/nvm.sh"
    nvm install 20
    nvm use 20
fi

NODE_BIN=$(command -v node)
NPM_BIN=$(command -v npm)
echo -e "  ✔ Using Node: ${GREEN}$($NODE_BIN -v)${NC} at $NODE_BIN"
echo -e "  ✔ Using NPM:  ${GREEN}$($NPM_BIN -v)${NC} at $NPM_BIN"

# ------------------------------------------------------------------------------
# 1. Project Directory & Git Sync
# ------------------------------------------------------------------------------
echo -e "\n${BLUE}[1/6] Setting up project directory at ${PROJECT_DIR}...${NC}"
if [ -d "$PROJECT_DIR" ]; then
    cd "$PROJECT_DIR"
    git fetch origin main
    git reset --hard origin/main
else
    git clone https://github.com/mugaitechnologies26/mythconnect.git "$PROJECT_DIR"
    cd "$PROJECT_DIR"
fi

# ------------------------------------------------------------------------------
# 2. Database Initialization
# ------------------------------------------------------------------------------
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

# ------------------------------------------------------------------------------
# 3. Environment Configuration
# ------------------------------------------------------------------------------
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

# ------------------------------------------------------------------------------
# 4. Backend Dependencies & Frontend Assets
# ------------------------------------------------------------------------------
echo -e "\n${BLUE}[4/6] Installing backend dependencies...${NC}"
cd "$PROJECT_DIR/backend-node"
$NPM_BIN install --production --silent

if [ -f "$PROJECT_DIR/frontend/dist/index.html" ]; then
    echo -e "  ✔ Found pre-built production frontend assets."
else
    echo -e "  -> Building frontend SPA with $NPM_BIN..."
    cd "$PROJECT_DIR/frontend"
    cat << EOF > "$PROJECT_DIR/frontend/.env.production"
VITE_API_URL=https://rkenterprisess.net
VITE_WS_URL=wss://rkenterprisess.net/ws
EOF
    $NPM_BIN install --silent
    $NPM_BIN run build
fi

# ------------------------------------------------------------------------------
# 5. Publish Frontend to Web Root & Configure .htaccess
# ------------------------------------------------------------------------------
echo -e "\n${BLUE}[5/6] Publishing Frontend to Web Root (${WEB_ROOT})...${NC}"
mkdir -p "$WEB_ROOT"
cp -r "$PROJECT_DIR/frontend/dist/"* "$WEB_ROOT/"

# Generate .htaccess for LiteSpeed / Apache reverse proxy
cat << 'EOF' > "$WEB_ROOT/.htaccess"
RewriteEngine On
RewriteBase /

# 1. Forward /api and /api/* to the PHP reverse proxy
RewriteRule ^api$ api-proxy.php?__path= [QSA,L]
RewriteRule ^api/(.*)$ api-proxy.php?__path=$1 [QSA,L]

# 2. Single Page Application (SPA) routing fallback
RewriteCond %{REQUEST_FILENAME} !-f
RewriteCond %{REQUEST_FILENAME} !-d
RewriteRule ^ index.html [L]
EOF

echo -e "  ${GREEN}✔ Frontend deployed to public_html with .htaccess reverse proxy.${NC}"

# ------------------------------------------------------------------------------
# 6. Start Backend Process & Crontab Auto-Restart
# ------------------------------------------------------------------------------
echo -e "\n${BLUE}[6/6] Starting Backend Service on port ${APP_PORT}...${NC}"
cd "$PROJECT_DIR"
pkill -f "backend-node/server.js" 2>/dev/null || true

PORT=$APP_PORT nohup $NODE_BIN "$PROJECT_DIR/backend-node/server.js" > "$PROJECT_DIR/backend.log" 2>&1 &
sleep 2

# Verify process is running
if pgrep -f "backend-node/server.js" > /dev/null; then
    echo -e "  ${GREEN}✔ Backend running on port ${APP_PORT} (PID: $(pgrep -f "backend-node/server.js" | head -n1))${NC}"
else
    echo -e "  ${YELLOW}[WARN] Checking backend log:${NC}"
    tail -n 15 "$PROJECT_DIR/backend.log" || true
fi

# Ensure process auto-restarts via crontab on reboot
(crontab -l 2>/dev/null | grep -v "server.js" ; echo "@reboot cd $PROJECT_DIR && PORT=$APP_PORT $NODE_BIN backend-node/server.js >> backend.log 2>&1 &") | crontab - 2>/dev/null || true

echo -e "\n${CYAN}================================================================================${NC}"
echo -e "${GREEN}${BOLD}    🎉 DEPLOYMENT SUCCESSFUL ON RKENTERPRISESS.NET!                            ${NC}"
echo -e "${CYAN}================================================================================${NC}"
echo -e "  🌐 Website: https://rkenterprisess.net"
echo -e "  📡 API:     https://rkenterprisess.net/api"
echo -e "  🔌 WS:      wss://rkenterprisess.net/ws"
echo -e "${CYAN}================================================================================${NC}\n"
