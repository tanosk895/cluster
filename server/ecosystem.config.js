module.exports = {
  apps: [{
    name: 'obd-server',
    script: './server.js',
    cwd: '/path/to/your/server', // Cambia con il path corretto
    instances: 1,
    autorestart: true,
    watch: false,
    max_memory_restart: '200M',
    restart_delay: 2000,
    max_restarts: 15, // Massimo 15 riavvii in 1 minuto
    min_uptime: '10s', // Deve restare attivo almeno 10 secondi
    exp_backoff_restart_delay: 100, // Delay esponenziale tra riavvii
    env: {
      NODE_ENV: 'production',
      PORT: 3000
    },
    log_file: './logs/obd-combined.log',
    out_file: './logs/obd-out.log',
    error_file: './logs/obd-error.log',
    log_date_format: 'YYYY-MM-DD HH:mm:ss Z',
    merge_logs: true
  }]
}; 