const colors = {
  reset: '\x1b[0m',
  blue: '\x1b[34m',
  green: '\x1b[32m',
  yellow: '\x1b[33m',
  red: '\x1b[31m',
  cyan: '\x1b[36m'
};

function formatMessage(level, prefix, message, meta) {
  const timestamp = new Date().toISOString();
  const metaStr = meta ? ` | ${JSON.stringify(meta)}` : '';
  return `[${timestamp}] [${prefix}] ${message}${metaStr}`;
}

const logger = {
  info: (prefix, message, meta) => {
    console.log(`${colors.cyan}[INFO]${colors.reset} ${formatMessage('INFO', prefix, message, meta)}`);
  },
  success: (prefix, message, meta) => {
    console.log(`${colors.green}[SUCCESS]${colors.reset} ${formatMessage('SUCCESS', prefix, message, meta)}`);
  },
  warn: (prefix, message, meta) => {
    console.warn(`${colors.yellow}[WARN]${colors.reset} ${formatMessage('WARN', prefix, message, meta)}`);
  },
  error: (prefix, message, meta) => {
    console.error(`${colors.red}[ERROR]${colors.reset} ${formatMessage('ERROR', prefix, message, meta)}`);
  }
};

module.exports = logger;
