const express = require('express');
const cors = require('cors');
const bodyParser = require('body-parser');
const helmet = require('helmet');
const config = require('./config');
const { errorHandler } = require('./middleware/errorHandler');
const rateLimiter = require('./middleware/rateLimiter');
const { createLogger } = require('./utils/logger');

const authRoutes = require('./routes/auth');
const projectRoutes = require('./routes/projects');
const eventRoutes = require('./routes/events');
const statsRoutes = require('./routes/stats');
const analyticsRoutes = require('./routes/analytics');

const logger = createLogger('App');

function createApp() {
  const app = express();

  setupMiddleware(app);
  setupRoutes(app);
  setupErrorHandling(app);

  return app;
}

function setupMiddleware(app) {
  app.use(helmet({
    contentSecurityPolicy: false,
    crossOriginEmbedderPolicy: false,
  }));

  app.use(cors({
    origin: config.cors.origin,
    methods: ['GET', 'POST', 'OPTIONS'],
    allowedHeaders: ['Content-Type', 'Authorization'],
    credentials: config.cors.credentials,
  }));

  app.options('*', cors());
  app.use(bodyParser.json({ limit: '10mb' }));
  app.use(bodyParser.urlencoded({ extended: true }));

  app.use((req, res, next) => {
    if (req.path === '/health') return next();
    rateLimiter(req, res, next);
  });
}

function setupRoutes(app) {
  app.get('/health', (req, res) => {
    res.json({ status: 'ok', timestamp: new Date().toISOString() });
  });

  app.use('/api', authRoutes);
  app.use('/api/projects', projectRoutes);
  app.use('/api/events', eventRoutes);
  app.use('/api/projects', statsRoutes);
  app.use('/api/analytics', analyticsRoutes);
}

function setupErrorHandling(app) {
  app.use(errorHandler);
}

module.exports = createApp;

