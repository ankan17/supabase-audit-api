import { Request, Response, NextFunction } from 'express';

// A utility function to eliminate try/catch boilerplate in async route handlers
export const asyncWrap = (
  fn: (req: Request, res: Response, next: NextFunction) => Promise<unknown>,
) => {
  return (req: Request, res: Response, next: NextFunction) => {
    Promise.resolve(fn(req, res, next)).catch(next);
  };
};
