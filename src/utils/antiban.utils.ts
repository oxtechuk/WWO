/**
 * Wox WhatsApp - Anti-Ban Engine & Human Simulation Utilities
 * Ox Tech WhatsApp Gateway
 */

/**
 * Parses and replaces Spintax patterns such as:
 * "{مرحباً|أهلاً|السلام عليكم} يا {name}، يسعدنا خدمتك..."
 * with a randomly selected variation to prevent duplicate text signatures.
 */
export function parseSpintax(text: string): string {
  if (!text || typeof text !== 'string') return '';
  const spintaxRegex = /\{([^{}]+)\}/g;
  
  let result = text;
  let matches = result.match(spintaxRegex);
  
  // Recursively process nested or multiple spintax brackets
  while (matches && matches.length > 0) {
    for (const match of matches) {
      const choices = match.slice(1, -1).split('|');
      const randomChoice = choices[Math.floor(Math.random() * choices.length)].trim();
      result = result.replace(match, randomChoice);
    }
    matches = result.match(spintaxRegex);
  }
  
  return result;
}

/**
 * Replaces dynamic variables such as {{name}}, {{order_id}}, {{amount}} in message templates
 */
export function renderTemplateVariables(template: string, vars: Record<string, string | number>): string {
  if (!template) return '';
  let rendered = template;
  
  for (const [key, val] of Object.entries(vars)) {
    const pattern = new RegExp(`\\{\\{\\s*${key}\\s*\\}\\}`, 'gi');
    rendered = rendered.replace(pattern, String(val));
  }
  
  return rendered;
}

/**
 * Calculates human typing simulation delay based on message character count.
 * Returns typing delay in milliseconds (min 2000ms, max 8000ms).
 */
export function calculateTypingDelay(text: string): number {
  const charCount = (text || '').length;
  // Human typing speed: ~40ms per character with jitter
  const calculated = charCount * 40 + Math.floor(Math.random() * 1500) + 1000;
  return Math.min(Math.max(calculated, 1800), 7500);
}

/**
 * Calculates safe delay between broadcast messages to emulate human pacing
 * Returns interval in milliseconds (default between 7,000ms and 22,000ms).
 */
export function calculateBroadcastInterval(): number {
  // Random jitter between 7 and 20 seconds
  return Math.floor(Math.random() * 13000) + 7000;
}

/**
 * Recommended daily sending limits according to number warm-up stage
 */
export interface WarmUpLimits {
  stage: 'DAY_1_3' | 'DAY_4_7' | 'WEEK_2' | 'MATURE';
  maxDailyMessages: number;
  intervalSecMin: number;
  intervalSecMax: number;
}

export function getWarmUpLimit(daysActive: number): WarmUpLimits {
  if (daysActive <= 3) {
    return { stage: 'DAY_1_3', maxDailyMessages: 50, intervalSecMin: 15, intervalSecMax: 35 };
  } else if (daysActive <= 7) {
    return { stage: 'DAY_4_7', maxDailyMessages: 150, intervalSecMin: 10, intervalSecMax: 25 };
  } else if (daysActive <= 14) {
    return { stage: 'WEEK_2', maxDailyMessages: 500, intervalSecMin: 7, intervalSecMax: 18 };
  }
  return { stage: 'MATURE', maxDailyMessages: 2500, intervalSecMin: 5, intervalSecMax: 15 };
}
