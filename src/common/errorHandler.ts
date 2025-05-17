import { Request, Response, NextFunction } from 'express';

export class HttpException extends Error {
  statusCode: number;

  constructor(message: string, statusCode: number) {
    super(message);
    this.statusCode = statusCode;
    this.name = this.constructor.name;
    Error.captureStackTrace(this, this.constructor);
  }
}

// Common HTTP exceptions
export class BadRequestException extends HttpException {
  constructor(message: string = 'Bad Request') {
    super(message, 400);
  }
}

export class UnauthorizedException extends HttpException {
  constructor(message: string = 'Unauthorized') {
    super(message, 401);
  }
}

export class ForbiddenException extends HttpException {
  constructor(message: string = 'Forbidden') {
    super(message, 403);
  }
}

export class NotFoundException extends HttpException {
  constructor(message: string = 'Not Found') {
    super(message, 404);
  }
}

export class ConflictException extends HttpException {
  constructor(message: string = 'Conflict') {
    super(message, 409);
  }
}

export class InternalServerErrorException extends HttpException {
  constructor(message: string = 'Internal Server Error') {
    super(message, 500);
  }
}

// Global error handling middleware
export const errorHandler = (
  err: Error | HttpException,
  _req: Request,
  res: Response,
  next: NextFunction,
) => {
  console.error('Error:', err);

  if (res.headersSent) {
    next(err);
    return;
  }

  // Determine if this is a known HTTP exception
  if (err instanceof HttpException) {
    res.status(err.statusCode).json({
      error: err.message,
    });
    return;
  }

  // Default error response for unexpected errors
  res.status(500).json({
    error: 'Internal Server Error',
    message: process.env.NODE_ENV === 'development' ? err.message : undefined,
  });
};
