#!/usr/bin/env bash
set -e

echo "=================================================="
echo " Starting Myth Connect Backend for rkenterprisess "
echo "=================================================="

# 1. Detect Node.js or install via NVM
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
    echo "Node.js not in PATH. Installing Node.js v20 via NVM..."
    curl -o- https://raw.githubusercontent.com/nvm-sh/nvm/v0.39.7/install.sh | bash
    export NVM_DIR="$HOME/.nvm"
    [ -s "$NVM_DIR/nvm.sh" ] && \. "$NVM_DIR/nvm.sh"
    nvm install 20
    nvm use 20
fi

NODE_BIN=$(command -v node)
NPM_BIN=$(command -v npm)

echo "Using Node: $($NODE_BIN -v) ($NODE_BIN)"
echo "Using NPM:  $($NPM_BIN -v) ($NPM_BIN)"

PROJECT_DIR="${HOME:-/home/u395270878}/mythconnect"
if [ ! -d "$PROJECT_DIR" ]; then
    echo "Cloning repository..."
    git clone https://github.com/mugaitechnologies26/mythconnect.git "$PROJECT_DIR"
else
    cd "$PROJECT_DIR"
    git fetch origin main
    git reset --hard origin/main
fi

cd "$PROJECT_DIR/backend-node"

# 2. Configure .env if missing
if [ ! -f .env ]; then
cat << EOF > .env
PORT=5050
NODE_ENV=production
APP_URL=https://rkenterprisess.net
DB_HOST=localhost
DB_PORT=3306
DB_USER=u395270878_admin
DB_PASSWORD=Ajay@2001and2025
DB_NAME=u395270878_crm
JWT_SECRET=mythconnect_rkenterprisess_secure_jwt_2026
CORS_ORIGIN=*
EOF
fi

# 3. Install dependencies
echo "Installing backend dependencies..."
$NPM_BIN install --production --silent

# 4. Copy API Proxy & .htaccess to public_html
WEB_ROOT="${HOME:-/home/u395270878}/domains/rkenterprisess.net/public_html"
if [ ! -d "$WEB_ROOT" ]; then
    WEB_ROOT="${HOME:-/home/u395270878}/public_html"
fi

mkdir -p "$WEB_ROOT"
cp "$PROJECT_DIR/frontend/dist/api-proxy.php" "$WEB_ROOT/" 2>/dev/null || true
cp "$PROJECT_DIR/frontend/dist/.htaccess" "$WEB_ROOT/" 2>/dev/null || true

# 5. Stop old process and start fresh
pkill -f "server.js" 2>/dev/null || true
sleep 1

PORT=5050 nohup $NODE_BIN "$PROJECT_DIR/backend-node/server.js" > "$HOME/backend.log" 2>&1 &
sleep 2

# 6. Check status
if pgrep -f "server.js" > /dev/null; then
    echo "=================================================="
    echo " 🎉 BACKEND SUCCESSFULLY RUNNING ON PORT 5050!"
    echo " PID: $(pgrep -f "server.js" | head -n1)"
    echo " API: https://rkenterprisess.net/api"
    echo " Log: $HOME/backend.log"
    echo "=================================================="
    echo "Testing internal API endpoint:"
    curl -s http://127.0.0.1:5050/api || true
    echo ""
else
    echo "Backend process exited. Recent log output:"
    cat "$HOME/backend.log"
fi

# 6. Auto-start on reboot
(crontab -l 2>/dev/null | grep -v "server.js" ; echo "@reboot cd $PROJECT_DIR/backend-node && PORT=5050 $NODE_BIN server.js >> $HOME/backend.log 2>&1 &") | crontab - 2>/dev/null || true

