import { Request, Response, NextFunction } from 'express';

// Custom error class for API errors
export class ApiError extends Error {
  constructor(
    public statusCode: number,
    message: string,
  ) {
    super(message);
    this.name = 'ApiError';
  }
}

// Global error logging function
export function logError(error: Error, req?: Request) {
  const timestamp = new Date().toISOString();
  const errorDetails = {
    timestamp,
    name: error.name,
    message: error.message,
    stack: error.stack,
    path: req?.path,
    method: req?.method,
  };
  
  console.error('Error occurred:', JSON.stringify(errorDetails, null, 2));
}

// Global error handler middleware
export const errorHandler = (err: Error, req: Request, res: Response, next: NextFunction): void => {
  logError(err, req);

  // Handle specific API errors
  if (err instanceof ApiError) {
    res.status(err.statusCode).json({
      error: err.message
    });
    return;
  }

  // Handle multer errors
  if (err.name === 'MulterError') {
    res.status(400).json({
      error: `File upload error: ${err.message}`
    });
    return;
  }

  // Handle database errors
  if (err.message.includes('SQLITE_CONSTRAINT')) {
    res.status(400).json({
      error: 'Database constraint violation'
    });
    return;
  }

  // Default error response
  res.status(500).json({
    error: 'Internal server error'
  });
}
