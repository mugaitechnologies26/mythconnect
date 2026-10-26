require('dotenv').config();

module.exports = {
  port: process.env.PORT || 5000,
  nodeEnv: process.env.NODE_ENV || 'development',
  appUrl: process.env.APP_URL || 'https://mythconnect.mugaitechnologies.in',
  laravelApiUrl: process.env.LARAVEL_API_URL || 'http://127.0.0.1:8000/api',
  meta: {
    appId: process.env.META_APP_ID || '109823487192834',
    appSecret: process.env.META_APP_SECRET || 'dev_meta_secret_key',
    verifyToken: process.env.META_VERIFY_TOKEN || 'mythconnect_meta_verify_token_secure_2026',
    accessToken: process.env.META_ACCESS_TOKEN || 'EAABwz...'
  },
  whatsapp: {
    phoneNumberId: process.env.WHATSAPP_PHONE_NUMBER_ID || '108492019482910',
    businessAccountId: process.env.WHATSAPP_BUSINESS_ACCOUNT_ID || '391048201948201',
    verifyToken: process.env.WHATSAPP_VERIFY_TOKEN || 'mythconnect_whatsapp_verify_token_secure_2026',
    accessToken: process.env.WHATSAPP_ACCESS_TOKEN || 'EAABwz...'
  },
  corsOrigin: process.env.CORS_ORIGIN || '*',
  db: {
    host: process.env.DB_HOST || '127.0.0.1',
    port: parseInt(process.env.DB_PORT || '3306', 10),
    user: process.env.DB_USER || 'root',
    password: process.env.DB_PASSWORD || '',
    database: process.env.DB_NAME || 'mythconnect_crm',
    waitForConnections: true,
    connectionLimit: 15,
    queueLimit: 0,
    enableKeepAlive: true,
    keepAliveInitialDelay: 0
  }
};
