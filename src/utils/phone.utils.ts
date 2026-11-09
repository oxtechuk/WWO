/**
 * Wox WhatsApp - Phone Number Sanitizer & Normalizer
 * Handles Saudi Arabia (KSA), Egypt (EG), and international number formats
 * Ensures proper E.164 without symbols for Baileys WhatsApp queries
 */

export interface SanitizedPhoneResult {
  raw: string;
  sanitized: string;
  jid: string;
  country: 'SA' | 'EG' | 'INTL';
  isValid: boolean;
}

export function sanitizePhoneNumber(input: string, defaultCountry: 'SA' | 'EG' = 'SA'): SanitizedPhoneResult {
  if (!input || typeof input !== 'string') {
    return { raw: input || '', sanitized: '', jid: '', country: 'INTL', isValid: false };
  }

  const raw = input.trim();

  // If already a group or broadcast JID, return as is
  if (raw.includes('@g.us') || raw.includes('@broadcast')) {
    return { raw, sanitized: raw, jid: raw, country: 'INTL', isValid: true };
  }

  // Extract digits only (ignore @s.whatsapp.net if present)
  let clean = raw.split('@')[0].replace(/[^\d+]/g, '');

  // Remove leading + or 00
  if (clean.startsWith('+')) {
    clean = clean.substring(1);
  } else if (clean.startsWith('00')) {
    clean = clean.substring(2);
  }

  let country: 'SA' | 'EG' | 'INTL' = 'INTL';

  // Check Egyptian format:
  // Starts with 010, 011, 012, 015 (11 digits local)
  if (/^01[0125]\d{8}$/.test(clean)) {
    clean = '20' + clean.substring(1);
    country = 'EG';
  } else if (/^201[0125]\d{8}$/.test(clean)) {
    country = 'EG';
  } else if (/^1[0125]\d{8}$/.test(clean) && defaultCountry === 'EG') {
    clean = '20' + clean;
    country = 'EG';
  }
  // Check Saudi format:
  // Starts with 05 (10 digits local, e.g., 0501234567, 055...)
  else if (/^05\d{8}$/.test(clean)) {
    clean = '966' + clean.substring(1);
    country = 'SA';
  } else if (/^9665\d{8}$/.test(clean)) {
    country = 'SA';
  } else if (/^5\d{8}$/.test(clean) && defaultCountry === 'SA') {
    clean = '966' + clean;
    country = 'SA';
  }

  // Validate minimum length for international phone numbers
  const isValid = clean.length >= 8 && clean.length <= 16 && /^\d+$/.test(clean);
  const jid = isValid ? `${clean}@s.whatsapp.net` : '';

  return {
    raw,
    sanitized: clean,
    jid,
    country,
    isValid,
  };
}

/**
 * Normalizes an array of phone numbers or JIDs
 */
export function sanitizePhoneNumbers(inputs: string[], defaultCountry: 'SA' | 'EG' = 'SA'): SanitizedPhoneResult[] {
  return (inputs || []).map((num) => sanitizePhoneNumber(num, defaultCountry));
}
