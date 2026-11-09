import { NextFunction, Request, Response } from 'express';
import DOMPurify from 'isomorphic-dompurify';
import { JSDOM } from 'jsdom';

const window = new JSDOM('').window;
const purify = DOMPurify(window);

function deepSanitize(obj: any): any {
  if (typeof obj === 'string') {
    // Preserve normal JSON strings, but sanitize dangerous script injections/tags
    return purify.sanitize(obj, {
      ALLOWED_TAGS: [], // Strip all HTML tags by default for API payload inputs
      ALLOWED_ATTR: [],
    });
  }
  if (Array.isArray(obj)) {
    return obj.map(deepSanitize);
  }
  if (obj !== null && typeof obj === 'object') {
    const sanitizedObj: Record<string, any> = {};
    for (const [key, value] of Object.entries(obj)) {
      // Don't modify base64 media payload or raw buffer strings
      if (
        key === 'base64' ||
        key === 'media' ||
        key === 'buffer' ||
        key === 'dataUrl' ||
        key === 'password'
      ) {
        sanitizedObj[key] = value;
      } else {
        sanitizedObj[key] = deepSanitize(value);
      }
    }
    return sanitizedObj;
  }
  return obj;
}

/**
 * Global input sanitization middleware to prevent XSS and malicious payloads
 */
export function sanitizeInput(req: Request, res: Response, next: NextFunction) {
  if (req.body && typeof req.body === 'object') {
    req.body = deepSanitize(req.body);
  }
  if (req.query && typeof req.query === 'object') {
    req.query = deepSanitize(req.query as any);
  }
  if (req.params && typeof req.params === 'object') {
    req.params = deepSanitize(req.params as any);
  }
  next();
}
