// ============================================
// PayFlux AI - Express Server Entry Point
// backend/server.js
// ============================================
// Bootstraps the server: loads config, connects DB,
// mounts middleware & routes, starts listening.

const express = require('express');
const cors = require('cors');
const helmet = require('helmet');
const morgan = require('morgan');

// -- Config & Utils --
const { config, validateEnv } = require('./src/config/env');
const { connectDB, disconnectDB } = require('./src/config/db');
const logger = require('./src/utils/logger');

// -- Middleware --
const { errorHandler, notFoundHandler } = require('./src/middleware/error.middleware');

// -- Routes --
const healthRoutes = require('./src/routes/health.routes');
const authRoutes = require('./src/routes/auth.routes');
const paymentRoutes = require('./src/routes/payment.routes');
const queueRoutes = require('./src/routes/queue.routes');
const webhookRoutes = require('./src/routes/webhook.routes');

// ---- Create Express App ----
const app = express();

// ---- Global Middleware ----

// Security headers
app.use(helmet());

// CORS — allow React Native dev client + web dashboard
app.use(
  cors({
    origin: config.isDev
      ? '*' // Allow all in development
      : ['http://localhost:3000', 'http://localhost:19006'], // Lock down in production
    methods: ['GET', 'POST', 'PUT', 'PATCH', 'DELETE'],
    allowedHeaders: ['Content-Type', 'Authorization'],
    credentials: true,
  })
);

// Request logging (dev: concise, prod: combined for log aggregation)
app.use(
  morgan(config.isDev ? 'dev' : 'combined', {
    stream: { write: (msg) => logger.info(msg.trim()) },
  })
);

// Body parsing
// NOTE: Webhook route needs raw body for signature verification,
// so we mount it BEFORE json() middleware below.
app.use('/api/webhooks', express.raw({ type: 'application/json' }), webhookRoutes);

// JSON & URL-encoded parsing for all other routes
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true, limit: '10mb' }));

// ---- API Routes ----
app.use('/api/health', healthRoutes);
app.use('/api/auth', authRoutes);
app.use('/api/payments', paymentRoutes);
app.use('/api/queue', queueRoutes);

// ---- Root Route ----
app.get('/', (req, res) => {
  res.json({
    name: 'PayFlux AI',
    version: '1.0.0',
    description: 'Smart Payment Gateway with Offline-First Processing & Payment Intelligence',
    docs: '/api/health',
  });
});

// ---- 404 & Error Handlers (must be LAST) ----
app.use(notFoundHandler);
app.use(errorHandler);

// ---- Start Server ----
async function startServer() {
  try {
    // Validate environment variables
    validateEnv();

    // Connect to MongoDB
    await connectDB();

    // Start listening
    const server = app.listen(config.port, () => {
      logger.info(`
╔══════════════════════════════════════════════════╗
║          🚀 PayFlux AI Server Started            ║
╠══════════════════════════════════════════════════╣
║  Port:        ${String(config.port).padEnd(34)}║
║  Environment: ${String(config.nodeEnv).padEnd(34)}║
║  MongoDB:     Connected                          ║
║  Health:      http://localhost:${config.port}/api/health   ║
╚══════════════════════════════════════════════════╝
      `);
    });

    // ---- Graceful Shutdown ----
    const shutdown = async (signal) => {
      logger.info(`\n${signal} received. Shutting down gracefully...`);
      server.close(async () => {
        await disconnectDB();
        logger.info('Server closed.');
        process.exit(0);
      });

      // Force exit after 10s
      setTimeout(() => {
        logger.error('Forced shutdown after timeout.');
        process.exit(1);
      }, 10000);
    };

    process.on('SIGTERM', () => shutdown('SIGTERM'));
    process.on('SIGINT', () => shutdown('SIGINT'));

    // Handle unhandled rejections
    process.on('unhandledRejection', (err) => {
      logger.error('Unhandled Promise Rejection:', err);
    });

    // Handle uncaught exceptions
    process.on('uncaughtException', (err) => {
      logger.error('Uncaught Exception:', err);
      process.exit(1);
    });
  } catch (error) {
    logger.error('Failed to start server:', error);
    process.exit(1);
  }
}

startServer();

module.exports = app; // Export for testing
