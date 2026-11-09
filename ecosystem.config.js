module.exports = {
  apps: [
    {
      name: 'wox-api',
      script: './dist/main.js',
      instances: 1,
      exec_mode: 'fork',
      autorestart: true,
      watch: false,
      max_memory_restart: '1536M',
      env: {
        NODE_ENV: 'production',
        SERVER_PORT: 8080,
      },
      log_date_format: 'YYYY-MM-DD HH:mm:ss Z',
      error_file: './store/pm2-error.log',
      out_file: './store/pm2-out.log',
      merge_logs: true,
      time: true,
    },
  ],
};
