const { WebSocketServer } = require('ws');
const logger = require('../../utils/logger');

class SocketManager {
  constructor() {
    this.wss = null;
    this.clients = new Set();
  }

  init(server) {
    this.wss = new WebSocketServer({ server, path: '/ws' });

    this.wss.on('connection', (ws, req) => {
      this.clients.add(ws);
      logger.info('REALTIME', `Client connected. Total active clients: ${this.clients.size}`);

      // Send initial welcome/ready handshake
      ws.send(JSON.stringify({
        event: 'connected',
        data: {
          message: 'Connected to Myth Connect.ai Realtime Gateway',
          timestamp: new Date().toISOString()
        }
      }));

      ws.on('message', (message) => {
        try {
          const parsed = JSON.parse(message);
          this.handleClientMessage(ws, parsed);
        } catch (e) {
          logger.warn('REALTIME', 'Received invalid JSON from client');
        }
      });

      ws.on('close', () => {
        this.clients.delete(ws);
        logger.info('REALTIME', `Client disconnected. Active clients: ${this.clients.size}`);
      });

      ws.on('error', (err) => {
        logger.error('REALTIME', 'WebSocket error', { error: err.message });
      });
    });

    logger.success('REALTIME', 'WebSocket server initialized on path /ws');
  }

  handleClientMessage(ws, payload) {
    const { action, channel } = payload;
    if (action === 'subscribe') {
      ws.subscription = channel;
      ws.send(JSON.stringify({ event: 'subscribed', channel }));
    } else if (action === 'ping') {
      ws.send(JSON.stringify({ event: 'pong', timestamp: Date.now() }));
    }
  }

  broadcast(event, data) {
    const payload = JSON.stringify({ event, data, timestamp: new Date().toISOString() });
    let sentCount = 0;

    for (const client of this.clients) {
      if (client.readyState === 1) { // 1 = OPEN
        client.send(payload);
        sentCount++;
      }
    }
    logger.info('REALTIME', `Broadcast [${event}] sent to ${sentCount} clients`, { event });
  }
}

module.exports = new SocketManager();
