import { NextFunction, Request, Response } from 'express';
import { v4 as uuidv4 } from 'uuid';

/**
 * Middleware to assign and propagate unique X-Request-ID for end-to-end tracing and logging
 */
export function requestIdMiddleware(req: Request, res: Response, next: NextFunction) {
  const incomingId = (req.headers['x-request-id'] as string) || (req.headers['x-correlation-id'] as string);
  const requestId = incomingId && incomingId.trim().length > 0 ? incomingId : uuidv4();

  req['requestId'] = requestId;
  res.setHeader('X-Request-ID', requestId);
  next();
}
