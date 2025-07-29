module.exports = {
  apps: [
    {
      name: "ksaunibliss-backend",
      script: "index.js",
      cwd: "/var/www/ksaunibliss/server",
      instances: 2,
      exec_mode: "cluster",
      env: {
        NODE_ENV: "production",
        PORT: 5000,
      },
      env_production: {
        NODE_ENV: "production",
        PORT: 5000,
      },
      log_file: "/var/log/pm2/ksaunibliss-backend.log",
      out_file: "/var/log/pm2/ksaunibliss-backend-out.log",
      error_file: "/var/log/pm2/ksaunibliss-backend-error.log",
      log_date_format: "YYYY-MM-DD HH:mm:ss Z",
      merge_logs: true,
      max_memory_restart: "1G",
      node_args: "--max-old-space-size=1024",
      watch: false,
      ignore_watch: ["node_modules", "uploads", "logs"],
      max_restarts: 10,
      min_uptime: "10s",
      kill_timeout: 5000,
      wait_ready: true,
      listen_timeout: 10000,
    },
  ],
}
