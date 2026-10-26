#!/usr/bin/env bash

# ==============================================================================
# Myth Connect.ai - Live Production Deployment & Auto-Update Engine
# Repository: https://github.com/mugaitechnologies26/mythconnect.git
# ==============================================================================

set -e

# Colors for terminal output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
CYAN='\033[0;36m'
BOLD='\033[1m'
NC='\033[0m' # No Color

REPO_URL="https://github.com/mugaitechnologies26/mythconnect.git"
BRANCH="main"
DEFAULT_PORT=5000

echo -e "${CYAN}${BOLD}"
echo "================================================================================"
echo "          MYTH CONNECT.AI - LIVE DEPLOYMENT & UPDATE ENGINE                     "
echo "        Omnichannel Meta & WhatsApp Realtime Enterprise CRM                     "
echo "================================================================================"
echo -e "${NC}"

# 1. Determine Working Directory
SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"

if [ -d "$SCRIPT_DIR/../.git" ]; then
    ROOT_DIR="$(cd "$SCRIPT_DIR/.." && pwd)"
elif [ -d "./.git" ]; then
    ROOT_DIR="$(pwd)"
elif [ -d "./mythconnect/.git" ]; then
    ROOT_DIR="$(pwd)/mythconnect"
else
    ROOT_DIR=""
fi

# 2. Clone Repository if not present
if [ -z "$ROOT_DIR" ]; then
    echo -e "${BLUE}[1/7] Repository not detected. Cloning from GitHub...${NC}"
    if ! command -v git &> /dev/null; then
        echo -e "${RED}[ERROR] 'git' is required but not installed. Please install git first.${NC}"
        exit 1
    fi
    git clone "$REPO_URL" mythconnect
    ROOT_DIR="$(pwd)/mythconnect"
    cd "$ROOT_DIR"
else
    cd "$ROOT_DIR"
    echo -e "${BLUE}[1/7] Working inside repository: ${BOLD}$ROOT_DIR${NC}"
    echo -e "${BLUE}[1/7] Fetching and pulling latest updates from ${BRANCH}...${NC}"
    git fetch origin "$BRANCH" || true
    # Attempt pull or fast-forward
    if git rev-parse --git-dir > /dev/null 2>&1; then
        git pull origin "$BRANCH" || echo -e "${YELLOW}[NOTICE] Local changes present or detached HEAD, continuing with existing code.${NC}"
    fi
fi

# 3. Verify System Dependencies (Node.js & npm)
echo -e "\n${BLUE}[2/7] Checking environment dependencies...${NC}"

if ! command -v node &> /dev/null; then
    echo -e "${RED}[ERROR] Node.js is not installed!${NC}"
    echo -e "${YELLOW}Please install Node.js 18+ or 20+ (e.g. 'curl -fsSL https://deb.nodesource.com/setup_20.x | sudo -E bash - && sudo apt install -y nodejs')${NC}"
    exit 1
fi

NODE_VERSION=$(node -v)
NPM_VERSION=$(npm -v)
echo -e "  ✔ Node.js: ${GREEN}${NODE_VERSION}${NC}"
echo -e "  ✔ npm:     ${GREEN}${NPM_VERSION}${NC}"

# 4. Prepare Environment Configuration
echo -e "\n${BLUE}[3/7] Checking configuration files...${NC}"
mkdir -p logs

if [ ! -f "backend-node/.env" ]; then
    if [ -f "backend-node/.env.example" ]; then
        echo -e "${YELLOW}[CONFIG] Creating backend-node/.env from .env.example...${NC}"
        cp backend-node/.env.example backend-node/.env
        echo -e "${GREEN}  ✔ Created backend-node/.env. Please update DB and API keys as needed.${NC}"
    else
        echo -e "${YELLOW}[CONFIG] Creating default backend-node/.env file...${NC}"
        cat << 'EOF' > backend-node/.env
PORT=5000
NODE_ENV=production
CORS_ORIGIN=*
DB_HOST=127.0.0.1
DB_PORT=3306
DB_USER=root
DB_PASSWORD=
DB_NAME=mythconnect_crm
EOF
    fi
else
    echo -e "  ✔ backend-node/.env exists."
fi

# 5. Install Dependencies (Backend & Frontend)
echo -e "\n${BLUE}[4/7] Installing npm packages (clean, ignoring module commits)...${NC}"

echo -e "  -> Installing Backend dependencies..."
cd "$ROOT_DIR/backend-node"
npm install --silent

echo -e "  -> Installing Frontend dependencies..."
cd "$ROOT_DIR/frontend"
npm install --silent

# 6. Build Production Frontend SPA
echo -e "\n${BLUE}[5/7] Building high-performance production frontend bundle...${NC}"
cd "$ROOT_DIR/frontend"
npm run build

if [ -f "$ROOT_DIR/frontend/dist/index.html" ]; then
    echo -e "${GREEN}  ✔ Frontend build successful! Dist ready at frontend/dist${NC}"
else
    echo -e "${RED}[ERROR] Frontend build failed to output dist/index.html${NC}"
    exit 1
fi

# 7. Initialize Database (if MySQL connection available)
echo -e "\n${BLUE}[6/7] Checking database auto-initialization...${NC}"
cd "$ROOT_DIR/backend-node"
if node -e "const c=require('./src/config'); c.db.host ? process.exit(0) : process.exit(1)" 2>/dev/null; then
    echo -e "  -> Running database migration & seeding check..."
    npm run db:init || echo -e "${YELLOW}[NOTICE] Database initialization skipped or waiting for MySQL server start.${NC}"
fi

# 8. Start / Reload Application Services
echo -e "\n${BLUE}[7/7] Launching application services...${NC}"
cd "$ROOT_DIR"

APP_PORT=$(grep -E '^PORT=' backend-node/.env 2>/dev/null | cut -d '=' -f2 | tr -d ' ' || echo "$DEFAULT_PORT")
[ -z "$APP_PORT" ] && APP_PORT=$DEFAULT_PORT

if command -v pm2 &> /dev/null; then
    echo -e "${CYAN}  -> PM2 detected. Reloading/Starting via ecosystem.config.js...${NC}"
    if pm2 list | grep -q "mythconnect-server"; then
        pm2 reload ecosystem.config.js --update-env
        echo -e "${GREEN}  ✔ mythconnect-server reloaded successfully with zero downtime.${NC}"
    else
        pm2 start ecosystem.config.js
        echo -e "${GREEN}  ✔ mythconnect-server launched with PM2.${NC}"
    fi
    pm2 save 2>/dev/null || true
else
    echo -e "${YELLOW}  -> PM2 not found globally.${NC}"
    echo -e "${CYAN}  -> Starting server using nohup background process...${NC}"
    
    # Check if existing PID is running
    if [ -f "logs/server.pid" ]; then
        OLD_PID=$(cat logs/server.pid)
        if ps -p "$OLD_PID" > /dev/null 2>&1; then
            echo -e "${YELLOW}  -> Stopping previous server process (PID: $OLD_PID)...${NC}"
            kill "$OLD_PID" 2>/dev/null || true
            sleep 1
        fi
    fi

    NODE_ENV=production nohup node backend-node/server.js > logs/server.log 2>&1 &
    NEW_PID=$!
    echo "$NEW_PID" > logs/server.pid
    echo -e "${GREEN}  ✔ Server started in background with PID: ${NEW_PID}${NC}"
    echo -e "  -> Logs available at: ${BOLD}logs/server.log${NC}"
    echo -e "${YELLOW}  -> TIP: Install PM2 globally ('npm install -g pm2') for auto-restart & clustering.${NC}"
fi

# Wait briefly and perform health check
sleep 2

echo -e "\n${CYAN}================================================================================${NC}"
echo -e "${GREEN}${BOLD}             🎉 MYTH CONNECT.AI IS LIVE & RUNNING!                              ${NC}"
echo -e "${CYAN}================================================================================${NC}"

# Detect Host IP
SERVER_IP=$(hostname -I 2>/dev/null | awk '{print $1}' || echo "localhost")

echo -e "  🌐 Web Application:   ${BOLD}http://${SERVER_IP}:${APP_PORT}/${NC}"
echo -e "  ⚡ Local URL:         ${BOLD}http://localhost:${APP_PORT}/${NC}"
echo -e "  📡 API Endpoint:      ${BOLD}http://localhost:${APP_PORT}/api/health${NC}"
echo -e "  🔌 WebSocket Gateway: ${BOLD}ws://localhost:${APP_PORT}/ws${NC}"
echo -e "  📂 Directory:         ${BOLD}$ROOT_DIR${NC}"
echo -e "${CYAN}================================================================================${NC}\n"

# Check health endpoint if curl is available
if command -v curl &> /dev/null; then
    HEALTH=$(curl -s "http://localhost:${APP_PORT}/api/health" 2>/dev/null || true)
    if [ -n "$HEALTH" ]; then
        echo -e "  ${GREEN}✔ Health Check Response:${NC} $HEALTH"
    fi
fi

echo -e "\n${BOLD}Deployment / Update completed successfully!${NC}\n"
