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
        PORT: "3005",
        SESSION_COOKIE_SECURE: "false",
        UPLOAD_PUBLIC_BASE: "http://10.10.11.12:3005/uploads",
      },
    },
  ],
};
