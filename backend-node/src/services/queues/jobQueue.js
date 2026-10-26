const EventEmitter = require('events');
const logger = require('../../utils/logger');

class JobQueue extends EventEmitter {
  constructor() {
    super();
    this.queue = [];
    this.isProcessing = false;
    this.completedCount = 0;
    this.failedCount = 0;
  }

  add(jobName, payload, options = { delay: 0, retries: 3 }) {
    const job = {
      id: `job_${Date.now()}_${Math.random().toString(36).substring(2, 7)}`,
      name: jobName,
      payload,
      options,
      attempts: 0,
      status: 'pending',
      createdAt: new Date()
    };

    if (options.delay > 0) {
      setTimeout(() => {
        this.queue.push(job);
        logger.info('QUEUE', `Delayed job queued: ${job.name} (#${job.id}) after ${options.delay}ms`);
        this.processNext();
      }, options.delay);
    } else {
      this.queue.push(job);
      logger.info('QUEUE', `Job queued: ${job.name} (#${job.id})`);
      this.processNext();
    }

    return job.id;
  }

  async processNext() {
    if (this.isProcessing || this.queue.length === 0) {
      return;
    }

    this.isProcessing = true;
    const job = this.queue.shift();
    job.status = 'processing';
    job.attempts++;

    try {
      logger.info('QUEUE', `Processing job: ${job.name} (#${job.id}) [Attempt ${job.attempts}]`);
      
      // Dispatch to registered event listeners
      this.emit(job.name, job.payload, job);
      
      job.status = 'completed';
      this.completedCount++;
      logger.success('QUEUE', `Job completed: ${job.name} (#${job.id})`);
    } catch (err) {
      logger.error('QUEUE', `Job failed: ${job.name} (#${job.id})`, { error: err.message });
      if (job.attempts < (job.options.retries || 3)) {
        logger.warn('QUEUE', `Re-queuing job #${job.id} for retry`);
        this.queue.push(job);
      } else {
        job.status = 'failed';
        this.failedCount++;
      }
    } finally {
      this.isProcessing = false;
      if (this.queue.length > 0) {
        setImmediate(() => this.processNext());
      }
    }
  }

  getStats() {
    return {
      pending: this.queue.length,
      isProcessing: this.isProcessing,
      completed: this.completedCount,
      failed: this.failedCount
    };
  }
}

module.exports = new JobQueue();
