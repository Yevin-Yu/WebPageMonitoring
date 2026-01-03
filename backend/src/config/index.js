require('dotenv').config();

module.exports = {
    port: parseInt(process.env.PORT, 10) || 3001,
    nodeEnv: process.env.NODE_ENV || 'development',
    cors: {
        origin: process.env.CORS_ORIGIN || (process.env.NODE_ENV === 'production' ? false : '*'),
        credentials: process.env.CORS_CREDENTIALS === 'true',
    },
    jwt: {
        secret: process.env.JWT_SECRET || 'default-secret-key-change-in-production',
        expiresIn: process.env.JWT_EXPIRES_IN || '7d',
    },
    dataDir: process.env.DATA_DIR || './data',
    logLevel: process.env.LOG_LEVEL || 'info',
    rateLimit: {
        windowMs: parseInt(process.env.RATE_LIMIT_WINDOW_MS, 10) || 60000,
        maxRequests: parseInt(process.env.RATE_LIMIT_MAX_REQUESTS, 10) || 100,
    },
};


