import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import { initDB } from './db/database';
import path from 'path';
import apiRoutes from './routes';
import http from 'http';

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

app.use(express.json());
app.use(express.urlencoded({ extended: true }));

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

// Serve static files from the Vue app build directory
app.use(express.static(clientDistPath));

// Handle any requests that don't match the API routes
// Using a regex pattern for the catch-all route to avoid path-to-regexp errors
app.get(/^(?!\/api).*/, (_, res) => {
  res.sendFile(path.join(clientDistPath, 'index.html'));
});

// Start server
server.listen(PORT, () => {
  console.log(`Server running in ${NODE_ENV} mode on port ${PORT}`);
  console.log(`Serving static files from: ${clientDistPath}`);
});

// Handle graceful shutdown
process.on('SIGTERM', () => {
  console.log('SIGTERM signal received: closing HTTP server');
  server.close(() => {
    console.log('HTTP server closed');
  });
});

export default app;
