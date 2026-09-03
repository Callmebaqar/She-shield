import type { NextFunction, Request, Response } from 'express';

export class AppError extends Error {
  statusCode: number;
  constructor(message: string, statusCode = 400) {
    super(message);
    this.statusCode = statusCode;
    this.name = 'AppError';
  }
}

type ApiFn = (req: any, res: Response, next: NextFunction) => unknown;

export function asyncHandler(fn: ApiFn) {
  return (req: Request, res: Response, next: NextFunction) => {
    Promise.resolve(fn(req, res, next)).catch(next);
  };
}

export function notFoundHandler(req: Request, res: Response, next: NextFunction) {
  next(new AppError(`Route not found: ${req.method} ${req.originalUrl}`, 404));
}

export function errorHandler(err: unknown, req: Request, res: Response, next: NextFunction) {
  if (res.headersSent) return next(err);

  const status = err instanceof AppError ? err.statusCode : 500;
  const message =
    err instanceof AppError
      ? err.message
      : 'Something went wrong on the server. Please try again later.';

  if (status >= 500) {
    // Log server errors, but never leak internals to the client.
    console.error('[ServerError]', err);
  }

  res.status(status).json({ error: message });
}
