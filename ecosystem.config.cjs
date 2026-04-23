module.exports = {
  apps: [
    {
      name: "online-application",
      cwd: __dirname,
      script: "npm",
      args: "start",
      exec_mode: "fork",
      instances: 1,
      autorestart: true,
      env: {
        NODE_ENV: "production",
        HOSTNAME: "0.0.0.0",
        PORT: "3005",
        SESSION_COOKIE_SECURE: "false",
        SERVER_ACTIONS_ALLOWED_ORIGINS: "localhost:3005,127.0.0.1:3005,41.59.57.5:3005",
        UPLOAD_PUBLIC_BASE: "/uploads",
      },
    },
  ],
};
