// Configuración PM2 optimizada para producción con auto-startup
module.exports = {
  apps: [
    {
      name: 'tienda-definitiva',
      script: 'server.js',
      cwd: '/home/developer/lovilike-dev',
      instances: 2, // Usar 2 instancias para estabilidad
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
      // Logs
      error_file: '/home/developer/lovilike-dev/logs/error.log',
      out_file: '/home/developer/lovilike-dev/logs/out.log',
      log_file: '/home/developer/lovilike-dev/logs/combined.log',
      log_date_format: 'YYYY-MM-DD HH:mm:ss Z',
      merge_logs: true,
      max_size: '10M',
      retain: 5,
      
      // Política de reinicio automático mejorada
      autorestart: true,
      restart_delay: 5000,
      max_restarts: 15,
      min_uptime: '30s',
      
      // Health checks
      health_check_http: 'http://localhost:3000/api/health',
      health_check_interval: 30000,
      health_check_grace_period: 10000,
      
      // Optimizaciones Node.js
      node_args: '--max-old-space-size=2048 --enable-source-maps',
      
      // Timeouts
      kill_timeout: 10000,
      listen_timeout: 5000,
      wait_ready: true,
      
      // Auto-startup después de crash
      crash_timeout: 2000,
      exponential_backoff_restart_delay: 100,
      
      // Ignorar archivos
      ignore_watch: ['node_modules', 'logs', '.next', 'prisma/dev.db', 'public/uploads'],
      
      // Configuración de clustering
      instance_var: 'INSTANCE_ID',
      
      // Script de pre-arranque
      pre_hook: '/home/developer/lovilike-dev/scripts/pre-start-health-check.sh',
      
      // Configuración adicional para estabilidad
      combine_logs: true,
      time: true
    }
  ]
}