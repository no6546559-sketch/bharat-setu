module.exports = {
  apps: [
    {
      name: 'bharat-setu',
      script: 'node',
      args: 'scripts/dev-server.mjs',
      cwd: '/home/user/webapp',
      env: { NODE_ENV: 'development', PORT: 3000 },
      watch: false,
      instances: 1,
      exec_mode: 'fork',
      max_memory_restart: '400M',
    },
  ],
}
