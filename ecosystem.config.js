module.exports = {
  apps: [
    {
      name: 'todo-telegram-app',
      script: '.output/server/index.mjs',
      env: {
        NODE_ENV: 'production',
        PORT: 3002
      }
    }
  ]
};
