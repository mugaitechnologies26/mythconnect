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

# 2. Configure .env if missing or update port to 39527
if [ ! -f .env ]; then
cat << EOF > .env
PORT=39527
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
else
    # Ensure port is strictly 39527 to prevent conflicts on shared host
    sed -i 's/PORT=.*/PORT=39527/g' .env 2>/dev/null || true
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
# Also copy to ~/public_html as safety fallback
if [ "$WEB_ROOT" != "${HOME:-/home/u395270878}/public_html" ]; then
    mkdir -p "${HOME:-/home/u395270878}/public_html"
    cp "$PROJECT_DIR/frontend/dist/api-proxy.php" "${HOME:-/home/u395270878}/public_html/" 2>/dev/null || true
    cp "$PROJECT_DIR/frontend/dist/.htaccess" "${HOME:-/home/u395270878}/public_html/" 2>/dev/null || true
fi

# 5. Stop old processes cleanly
echo "Stopping any existing node processes..."
pkill -9 -u "$USER" -f "server.js" 2>/dev/null || true
pkill -9 -u "$USER" -f "alt-nodejs" 2>/dev/null || true
sleep 1

# Start fresh on dedicated port 39527
echo "Launching Myth Connect Node server on port 39527..."
PORT=39527 nohup $NODE_BIN "$PROJECT_DIR/backend-node/server.js" </dev/null >> "$HOME/backend.log" 2>&1 &
disown -h %1 2>/dev/null || disown -a 2>/dev/null || true
sleep 2

# 6. Check status
if pgrep -f "server.js" > /dev/null; then
    PID=$(pgrep -f "server.js" | head -n1)
    echo "=================================================="
    echo " 🎉 BACKEND SUCCESSFULLY RUNNING ON PORT 39527!"
    echo " PID: $PID"
    echo " API: https://rkenterprisess.net/api"
    echo " Log: $HOME/backend.log"
    echo "=================================================="
    echo "Testing internal loopback response:"
    curl -s http://127.0.0.1:39527/api || true
    echo ""
else
    echo "Backend process exited. Recent log output:"
    tail -n 25 "$HOME/backend.log"
fi

# 7. Persistent Crontab Watchdog & Reboot auto-start
CRON_WATCHDOG="* * * * * pgrep -f \"server.js\" >/dev/null || (cd $PROJECT_DIR/backend-node && PORT=39527 $NODE_BIN server.js </dev/null >> $HOME/backend.log 2>&1 &)"
CRON_REBOOT="@reboot sleep 10 && cd $PROJECT_DIR/backend-node && PORT=39527 $NODE_BIN server.js </dev/null >> $HOME/backend.log 2>&1 &"

(crontab -l 2>/dev/null | grep -v "server.js" ; echo "$CRON_WATCHDOG" ; echo "$CRON_REBOOT") | crontab - 2>/dev/null || true
echo "✔ Crontab watchdog registered (auto-restarts within 60s if stopped)."

