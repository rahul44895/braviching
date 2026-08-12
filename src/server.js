const env = require('./config/env');
const app = require('./app');
const logger = require('./utils/logger');
const { sequelize } = require('./models');

process.on('unhandledRejection', (reason) => {
  logger.error('Unhandled promise rejection', {
    message: reason && reason.message,
    stack: reason && reason.stack,
  });
});

process.on('uncaughtException', (err) => {
  logger.error('Uncaught exception', { message: err.message, stack: err.stack });
  process.exit(1);
});

async function start() {
  await sequelize.authenticate();
  app.listen(env.PORT, () => {
    logger.info(`Server listening on port ${env.PORT}`);
  });
}

start().catch((err) => {
  logger.error('Failed to start server', { message: err.message, stack: err.stack });
  process.exit(1);
});
