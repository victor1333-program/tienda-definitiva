// Configuración PM2 optimizada para producción con auto-startup
module.exports = {
  apps: [
    {
      name: 'lovilike',
      script: 'server.js',
      cwd: '/root/projects/lovilike',
      instances: 2, // Usar 2 instancias para estabilidad
      exec_mode: 'cluster',
      watch: false,
      max_memory_restart: '1G',
      env: {
        NODE_ENV: 'production',
        PORT: 3001,
        DATABASE_URL: 'postgresql://lovilike_user:lovilike_2025@127.0.0.1:5433/lovilike_db',
        NEXTAUTH_URL: 'http://157.173.97.116:3001',
        AUTH_URL: 'http://157.173.97.116:3001',
        AUTH_TRUST_HOST: 'true',
        NEXTAUTH_SECRET: '9b4rDf79Pu/Ar4vRiQ0PPEy0W66G5wGQyepE+cVIhEs=',
        NEXT_PUBLIC_APP_URL: 'http://157.173.97.116:3001',
        NEXT_PUBLIC_API_URL: 'http://157.173.97.116:3001/api',
        CLOUDINARY_CLOUD_NAME: 'dwcnk6fkw',
        CLOUDINARY_API_KEY: '466753797638838',
        CLOUDINARY_API_SECRET: 'Skn_vHNYyAGmDxblTr27iuK06EQ'
      },
      env_production: {
        NODE_ENV: 'production',
        PORT: 3001,
        DATABASE_URL: 'postgresql://lovilike_user:lovilike_2025@127.0.0.1:5433/lovilike_db',
        NEXTAUTH_URL: 'http://157.173.97.116:3001',
        AUTH_URL: 'http://157.173.97.116:3001',
        AUTH_TRUST_HOST: 'true',
        NEXTAUTH_SECRET: '9b4rDf79Pu/Ar4vRiQ0PPEy0W66G5wGQyepE+cVIhEs=',
        NEXT_PUBLIC_APP_URL: 'http://157.173.97.116:3001',
        NEXT_PUBLIC_API_URL: 'http://157.173.97.116:3001/api',
        CLOUDINARY_CLOUD_NAME: 'dwcnk6fkw',
        CLOUDINARY_API_KEY: '466753797638838',
        CLOUDINARY_API_SECRET: 'Skn_vHNYyAGmDxblTr27iuK06EQ'
      },
      // Logs
      error_file: '/root/projects/lovilike/logs/error.log',
      out_file: '/root/projects/lovilike/logs/out.log',
      log_file: '/root/projects/lovilike/logs/combined.log',
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
      health_check_http: 'http://localhost:3001/api/health',
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
      
      // Script de pre-arranque (opcional, comentado si no existe)
      // pre_hook: '/root/projects/lovilike/scripts/pre-start-health-check.sh',
      
      // Configuración adicional para estabilidad
      combine_logs: true,
      time: true
    }
  ]
}