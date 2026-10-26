const logger = require('../../utils/logger');

class IdempotencyStore {
  constructor(ttlMs = 24 * 60 * 60 * 1000) {
    this.processedEvents = new Map();
    this.ttlMs = ttlMs;
  }

  isProcessed(eventId) {
    if (!eventId) return false;
    const timestamp = this.processedEvents.get(eventId);
    if (!timestamp) return false;
    
    // Check if expired
    if (Date.now() - timestamp > this.ttlMs) {
      this.processedEvents.delete(eventId);
      return false;
    }
    return true;
  }

  markProcessed(eventId, metadata = {}) {
    if (!eventId) return;
    this.processedEvents.set(eventId, Date.now());
    logger.info('IDEMPOTENCY', `Event marked processed: ${eventId}`, metadata);

    // Housekeeping if map grows large
    if (this.processedEvents.size > 10000) {
      const now = Date.now();
      for (const [key, ts] of this.processedEvents.entries()) {
        if (now - ts > this.ttlMs) {
          this.processedEvents.delete(key);
        }
      }
    }
  }
}

module.exports = new IdempotencyStore();
