module.exports = {
  apps: [
    {
      name: 'tiktokscript-app',
      script: 'xvfb-run',
      args: '-a pnpm run start:dev',
      interpreter: 'none',
      env: {
        NODE_ENV: 'production',
      },
    },
  ],
};
