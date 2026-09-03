// PM2 process configuration for the SheShield backend (VPS production).
// Usage: pm2 start ecosystem.config.cjs
module.exports = {
  apps: [
    {
      name: 'sheshield-api',
      cwd: __dirname,
      script: 'dist/index.js',
      instances: 1,
      exec_mode: 'fork',
      env: {
        NODE_ENV: 'production',
        PORT: process.env.PORT || 4000,
      },
    },
  ],
};
