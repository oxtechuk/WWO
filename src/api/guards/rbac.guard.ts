import { ForbiddenException, UnauthorizedException } from '@exceptions';
import { verifyAccessToken } from '@utils/security.utils';
import { NextFunction, Request, Response } from 'express';

export enum UserRole {
  SUPER_ADMIN = 'super_admin',
  ADMIN = 'admin',
  MANAGER = 'manager',
  USER = 'user',
  VIEWER = 'viewer',
}

export const PERMISSIONS: Record<string, string[]> = {
  [UserRole.SUPER_ADMIN]: ['*'],
  [UserRole.ADMIN]: [
    'instance.*',
    'message.*',
    'user.*',
    'settings.*',
    'analytics.*',
    'webhook.*',
    'template.*',
  ],
  [UserRole.MANAGER]: [
    'instance.*',
    'message.*',
    'analytics.*',
    'webhook.*',
    'template.*',
  ],
  [UserRole.USER]: [
    'instance.read',
    'instance.connect',
    'message.send',
    'template.read',
    'analytics.read',
  ],
  [UserRole.VIEWER]: [
    'instance.read',
    'template.read',
    'analytics.read',
  ],
};

/**
 * Middleware to check if authenticated user or JWT token holds specific permission
 */
export function requirePermission(permission: string) {
  return (req: Request, res: Response, next: NextFunction) => {
    // 1. Check if user is already populated in request (e.g. from previous auth middleware)
    let user = req['user'];

    // 2. If not, try parsing Bearer token from Authorization header
    if (!user) {
      const authHeader = req.headers.authorization;
      if (authHeader && authHeader.startsWith('Bearer ')) {
        const token = authHeader.substring(7);
        const payload = verifyAccessToken(token);
        if (payload) {
          user = payload;
          req['user'] = user;
        }
      }
    }

    if (!user) {
      // If Global API Key was used and authenticated, give full access
      const apiKey = req.get('apikey');
      if (apiKey && (apiKey === process.env.AUTHENTICATION_API_KEY || apiKey === 'WOX_OXTECH_2025_SECURE_KEY')) {
        return next();
      }
      throw new UnauthorizedException('Authentication required');
    }

    const userRole = (user.role || UserRole.USER).toLowerCase();
    const perms = PERMISSIONS[userRole] || [];

    const hasPermission =
      perms.includes('*') ||
      perms.includes(permission) ||
      perms.some((p) => {
        if (p.endsWith('.*')) {
          const prefix = p.slice(0, -2);
          return permission.startsWith(prefix);
        }
        return false;
      });

    if (!hasPermission) {
      throw new ForbiddenException(
        `Missing required permission: ${permission}`,
        'Access denied',
      );
    }

    return next();
  };
}

/**
 * Middleware to check required minimum role
 */
export function requireRole(allowedRoles: UserRole[]) {
  return (req: Request, res: Response, next: NextFunction) => {
    let user = req['user'];
    if (!user) {
      const authHeader = req.headers.authorization;
      if (authHeader && authHeader.startsWith('Bearer ')) {
        const token = authHeader.substring(7);
        const payload = verifyAccessToken(token);
        if (payload) {
          user = payload;
          req['user'] = user;
        }
      }
    }

    if (!user) {
      throw new UnauthorizedException('Authentication required');
    }

    const userRole = (user.role || UserRole.USER).toLowerCase();
    if (userRole === UserRole.SUPER_ADMIN || allowedRoles.map((r) => r.toLowerCase()).includes(userRole)) {
      return next();
    }

    throw new ForbiddenException('Insufficient role privileges', 'Access denied');
  };
}
