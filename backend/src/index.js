const config = require('./config');
const { initDatabase } = require('./database/init');
const createApp = require('./app');
const { createLogger } = require('./utils/logger');

const logger = createLogger('Server');

async function startServer() {
  try {
    initDatabase();
    
    const app = createApp();
    
    app.listen(config.port, () => {
      logger.info('Server started', {
        port: config.port,
        nodeEnv: config.nodeEnv,
      });
    });
  } catch (error) {
    logger.error('Failed to start server', error);
    process.exit(1);
  }
}

if (require.main === module) {
  startServer();
}

module.exports = createApp;
