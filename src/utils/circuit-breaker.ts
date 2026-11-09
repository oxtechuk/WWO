import { Logger } from '@config/logger.config';

export type CircuitBreakerState = 'CLOSED' | 'OPEN' | 'HALF_OPEN';

export interface CircuitBreakerOptions {
  threshold?: number;       // Consecutive failures before opening circuit
  timeout?: number;         // Time in ms to wait before trying HALF_OPEN
  name?: string;            // Name of the circuit for logs
}

/**
 * CircuitBreaker prevents cascading failures when external services (e.g. OpenAI, Webhooks, Meta, Baileys) are failing.
 */
export class CircuitBreaker {
  private failures = 0;
  private state: CircuitBreakerState = 'CLOSED';
  private nextAttempt = Date.now();
  private readonly threshold: number;
  private readonly timeout: number;
  private readonly name: string;
  private readonly logger: Logger;

  constructor(options?: CircuitBreakerOptions) {
    this.threshold = options?.threshold ?? 5;
    this.timeout = options?.timeout ?? 30000;
    this.name = options?.name ?? 'CircuitBreaker';
    this.logger = new Logger(this.name);
  }

  public getState(): CircuitBreakerState {
    return this.state;
  }

  public async execute<T>(action: () => Promise<T>): Promise<T> {
    if (this.state === 'OPEN') {
      if (Date.now() < this.nextAttempt) {
        throw new Error(`[${this.name}] Circuit is OPEN: Service is temporarily unavailable. Try again later.`);
      }
      this.state = 'HALF_OPEN';
      this.logger.warn(`[${this.name}] Circuit transitioning from OPEN to HALF_OPEN (probing...)`);
    }

    try {
      const result = await action();
      this.onSuccess();
      return result;
    } catch (err) {
      this.onFailure(err);
      throw err;
    }
  }

  private onSuccess(): void {
    if (this.state === 'HALF_OPEN') {
      this.logger.info(`[${this.name}] Probe succeeded. Circuit is now CLOSED.`);
    }
    this.failures = 0;
    this.state = 'CLOSED';
  }

  private onFailure(err: any): void {
    this.failures++;
    this.logger.warn(`[${this.name}] Execution failed (count: ${this.failures}/${this.threshold}): ${err?.message || err}`);

    if (this.failures >= this.threshold || this.state === 'HALF_OPEN') {
      this.state = 'OPEN';
      this.nextAttempt = Date.now() + this.timeout;
      this.logger.error(`[${this.name}] Threshold reached. Circuit is now OPEN for ${this.timeout / 1000}s.`);
    }
  }
}
