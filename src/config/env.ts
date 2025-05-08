import dotenv from 'dotenv';
import path from 'path';

// Load environment variables
dotenv.config();

// Server configuration
export const PORT = process.env.PORT || 3000;
export const NODE_ENV = process.env.NODE_ENV || 'development';