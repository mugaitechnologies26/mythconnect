const path = require('path');

module.exports = {
  apps: [
    {
      name: 'mythconnect-backend',
      script: './backend-node/server.js',
      cwd: __dirname,
      instances: 1,
      exec_mode: 'fork',
      autorestart: true,
      watch: false,
      max_memory_restart: '1G',
      env: {
        NODE_ENV: 'production',
        PORT: process.env.BACKEND_PORT || process.env.PORT || 5050
      },
      log_date_format: 'YYYY-MM-DD HH:mm:ss Z',
      error_file: './logs/backend-error.log',
      out_file: './logs/backend-out.log',
      merge_logs: true
    },
    {
      name: 'mythconnect-frontend',
      script: 'npm',
      args: 'run preview -- --host 127.0.0.1 --port ' + (process.env.FRONTEND_PORT || 3050),
      cwd: path.join(__dirname, 'frontend'),
      instances: 1,
      exec_mode: 'fork',
      autorestart: true,
      watch: false,
      max_memory_restart: '500M',
      env: {
        NODE_ENV: 'production'
      },
      log_date_format: 'YYYY-MM-DD HH:mm:ss Z',
      error_file: './logs/frontend-error.log',
      out_file: './logs/frontend-out.log',
      merge_logs: true
    }
  ]
};
