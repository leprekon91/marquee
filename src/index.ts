import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import { initDB } from './db/database';
import path from 'path';
import apiRoutes from './routes';
import http from 'http';
import { errorHandler, logError } from './middleware/errorHandler';

// Load environment variables
dotenv.config();

// Initialize Express app
const app = express();
const PORT = process.env.PORT || 3000;
const NODE_ENV = process.env.NODE_ENV || 'development';

// Create HTTP server
const server = http.createServer(app);

// Middleware
// Apply CORS in development only
if (NODE_ENV === 'development') {
  app.use(cors());
} else {
  // In production, only allow specific origins if needed
  app.use(cors({
    origin: NODE_ENV === 'production' ? false : '*', 
  }));
}

// Middleware to log all incoming requests
app.use((req, res, next) => {
  const timestamp = new Date().toISOString();
  console.log(`[${timestamp}] ${req.method} ${req.url}`);
  next();
});

app.use(express.json());
app.use(express.urlencoded({ extended: true }));

try {
  // Initialize database
  initDB();

  // API Routes
  app.use('/api', apiRoutes);

  // Determine client path based on environment
  let clientDistPath: string;
  if (NODE_ENV === 'development') {
    // In development, client/dist is relative to the project root
    clientDistPath = path.resolve(process.cwd(), 'client/dist');
  } else {
    // In production, client/dist is at a fixed path in the deployment directory
    clientDistPath = path.resolve(__dirname, '../client/dist');
  }

  // Serve uploads directory at multiple paths to ensure compatibility
  const uploadsPath = path.resolve(process.cwd(), 'uploads');

  // Serve uploads at both /uploads and /api/uploads paths to ensure all URLs work
  app.use('/uploads', express.static(uploadsPath));
  app.use('/api/uploads', express.static(uploadsPath));

  // Serve static files from the Vue app build directory
  app.use(express.static(clientDistPath));

  // Handle any requests that don't match the API routes
  // Using a regex pattern for the catch-all route to avoid path-to-regexp errors
  app.get(/^(?!\/api).*/, (_, res) => {
    res.sendFile(path.join(clientDistPath, 'index.html'));
  });

  // Global error handler - must be last middleware added
  app.use(errorHandler);

  // Start server
  server.listen(PORT, () => {
    console.log(`Server running in ${NODE_ENV} mode on port ${PORT}`);
    console.log(`Serving static files from: ${clientDistPath}`);
  });

  // Graceful shutdown handler
  const shutdown = (signal: string) => {
    console.log(`\n${signal} signal received. Starting graceful shutdown...`);
    server.close(() => {
      console.log('HTTP server closed.');
      process.exit(0);
    });

    // Force close after 10s
    setTimeout(() => {
      console.error('Could not close connections in time, forcefully shutting down');
      process.exit(1);
    }, 10000);
  };

  process.on('SIGTERM', () => shutdown('SIGTERM'));
  process.on('SIGINT', () => shutdown('SIGINT'));

} catch (err) {
  logError(err instanceof Error ? err : new Error('Failed to initialize application'));
  process.exit(1);
}

// Handle uncaught exceptions and unhandled rejections
process.on('uncaughtException', (err) => {
  logError(err);
  console.error('Uncaught Exception. Shutting down...');
  process.exit(1);
});

process.on('unhandledRejection', (reason) => {
  logError(reason instanceof Error ? reason : new Error('Unhandled Promise rejection'));
  console.error('Unhandled Promise Rejection. Shutting down...');
  process.exit(1);
});

export default app;
