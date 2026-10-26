const socketManager = require('../realtime/socketManager');
const logger = require('../../utils/logger');

class StatusTracker {
  constructor() {
    this.statusHistory = new Map();
  }

  recordStatus(wamid, status, details = {}) {
    const entry = {
      wamid,
      status,
      timestamp: new Date().toISOString(),
      details
    };
    
    if (!this.statusHistory.has(wamid)) {
      this.statusHistory.set(wamid, []);
    }
    this.statusHistory.get(wamid).push(entry);

    logger.info('STATUS_TRACKER', `Status recorded for ${wamid}: ${status}`);
    socketManager.broadcast('message.status_update', entry);
    return entry;
  }

  getHistory(wamid) {
    return this.statusHistory.get(wamid) || [];
  }
}

module.exports = new StatusTracker();
