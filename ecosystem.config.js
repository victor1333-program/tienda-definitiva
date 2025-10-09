// Configuración PM2 optimizada para VPS
module.exports = {
  apps: [
    {
      name: 'tienda-definitiva',
      script: 'server.js',
      instances: 'max', // Usar todos los cores disponibles
      exec_mode: 'cluster',
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
      // Logs optimizados
      error_file: './logs/error.log',
      out_file: './logs/out.log',
      log_file: './logs/combined.log',
      log_date_format: 'YYYY-MM-DD HH:mm:ss Z',
      merge_logs: true,
      
      // Restart policy mejorado
      autorestart: true,
      restart_delay: 4000,
      max_restarts: 10,
      min_uptime: '10s',
      
      // Optimizaciones de memoria Node.js
      node_args: '--max-old-space-size=1024',
      
      // Monitoring deshabilitado para mejor rendimiento
      monitoring: false,
      
      // Timeouts optimizados
      kill_timeout: 5000,
      listen_timeout: 3000,
      wait_ready: true,
      
      // Variables de entorno
      env_file: '.env.production',
      
      // Ignorar archivos para watch (deshabilitado en producción)
      ignore_watch: ['node_modules', 'logs', '.next', 'prisma/dev.db'],
    }
  ],

  deploy: {
    production: {
      user: 'root',
      host: 'YOUR_VPS_IP',
      ref: 'origin/main',
      repo: 'YOUR_GITHUB_REPO_URL',
      path: '/var/www/tienda-definitiva',
      'pre-deploy-local': '',
      'post-deploy': 'npm ci --only=production && npx prisma generate && npx prisma db push && npm run build && pm2 reload ecosystem.config.js --env production',
      'pre-setup': 'mkdir -p /var/www/tienda-definitiva/shared/logs'
    }
  }
}