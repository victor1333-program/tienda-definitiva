// Configuración PM2 para Next.js
module.exports = {
  apps: [
    {
      name: 'lovilike-app',
      script: 'server.js',
      cwd: '/home/appuser/app',
      instances: 1, // Cambiar a 'max' para usar todos los cores
      exec_mode: 'fork', // 'cluster' para múltiples instancias
      watch: false,
      max_memory_restart: '1G',
      env: {
        NODE_ENV: 'production',
        PORT: 3000
      },
      env_production: {
        NODE_ENV: 'production',
        PORT: 3000
      },
      error_file: '/home/appuser/logs/app-error.log',
      out_file: '/home/appuser/logs/app-out.log',
      log_file: '/home/appuser/logs/app-combined.log',
      time: true,
      
      // Auto restart settings
      autorestart: true,
      restart_delay: 4000,
      max_restarts: 10,
      min_uptime: '10s',
      
      // Monitoring
      monitoring: false,
      
      // Advanced PM2 features
      kill_timeout: 5000,
      listen_timeout: 3000,
      
      // Environment
      merge_logs: true,
      combine_logs: true
    }
  ],

  deploy: {
    production: {
      user: 'appuser',
      host: 'tu-servidor.hostinger.com',
      ref: 'origin/main',
      repo: 'https://github.com/tu-usuario/tienda-definitiva.git',
      path: '/home/appuser/app',
      'pre-deploy-local': '',
      'post-deploy': 'npm install && npx prisma generate && npx prisma db push && npm run build && pm2 reload ecosystem.config.js --env production',
      'pre-setup': ''
    }
  }
}