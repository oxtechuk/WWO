import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';

const JWT_SECRET = process.env.JWT_SECRET || 'wox_secure_secret_key_2025_oxtech';
const JWT_REFRESH_SECRET = process.env.JWT_REFRESH_SECRET || 'wox_refresh_secret_key_2025_oxtech';
const ACCESS_TOKEN_EXPIRY = '2h';
const REFRESH_TOKEN_EXPIRY = '30d';

export interface TokenPayload {
  userId: string;
  tenantId?: string;
  role: string;
}

export interface GeneratedTokens {
  accessToken: string;
  refreshToken: string;
  expiresIn: number; // in seconds (7200)
}

/**
 * Hash password securely with bcrypt (12 salt rounds)
 */
export async function hashPassword(password: string): Promise<string> {
  const salt = await bcrypt.genSalt(12);
  return bcrypt.hash(password, salt);
}

/**
 * Compare plain text password with stored bcrypt hash
 * Supports backward-compatibility if any plain text exists during migration
 */
export async function comparePassword(password: string, hashOrPlain: string): Promise<boolean> {
  if (!hashOrPlain) return false;
  
  // If stored value is bcrypt hash
  if (hashOrPlain.startsWith('$2a$') || hashOrPlain.startsWith('$2b$') || hashOrPlain.startsWith('$2y$')) {
    return bcrypt.compare(password, hashOrPlain);
  }
  
  // Fallback if password was stored plain during initial seed
  return password === hashOrPlain;
}

/**
 * Validate password strength
 */
export function validatePasswordStrength(password: string): { valid: boolean; message?: string } {
  if (!password || password.length < 8) {
    return { valid: false, message: 'كلمة المرور يجب ألا تقل عن 8 خانات' };
  }
  return { valid: true };
}

/**
 * Generate Access Token & Refresh Token pair
 */
export function generateTokens(payload: TokenPayload): GeneratedTokens {
  const accessToken = jwt.sign(payload, JWT_SECRET, { expiresIn: ACCESS_TOKEN_EXPIRY });
  const refreshToken = jwt.sign(
    { userId: payload.userId, type: 'refresh' },
    JWT_REFRESH_SECRET,
    { expiresIn: REFRESH_TOKEN_EXPIRY }
  );

  return {
    accessToken,
    refreshToken,
    expiresIn: 7200,
  };
}

/**
 * Verify Access Token
 */
export function verifyAccessToken(token: string): TokenPayload | null {
  try {
    return jwt.verify(token, JWT_SECRET) as TokenPayload;
  } catch (err) {
    return null;
  }
}

/**
 * Verify Refresh Token
 */
export function verifyRefreshToken(token: string): { userId: string } | null {
  try {
    return jwt.verify(token, JWT_REFRESH_SECRET) as { userId: string };
  } catch (err) {
    return null;
  }
}

/**
 * Generate secure numeric OTP (for 2FA via WhatsApp or email)
 */
export function generateOtp(length = 6): string {
  let otp = '';
  for (let i = 0; i < length; i++) {
    otp += Math.floor(Math.random() * 10).toString();
  }
  return otp;
}
