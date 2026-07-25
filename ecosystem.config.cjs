module.exports = {
  apps: [
    {
      name: 'fta-invoice-pro',
      cwd: '/home/USERNAME/apps/ftainvoicepro',
      script: 'npm',
      args: 'run start:hostinger',
      env: {
        NODE_ENV: 'production',
        PORT: 3000,
      },
      max_memory_restart: '512M',
      autorestart: true,
      watch: false,
    },
  ],
};
