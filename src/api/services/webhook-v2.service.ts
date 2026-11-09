import { Logger } from '@config/logger.config';
import axios from 'axios';
import crypto from 'crypto';
import { v4 as uuidv4 } from 'uuid';

export interface WebhookDeliveryJob {
  id: string;
  url: string;
  secret?: string;
  event: string;
  payload: Record<string, any>;
  attempts: number;
  maxAttempts: number;
  lastAttemptAt?: Date;
  nextAttemptAt?: Date;
  status: 'pending' | 'delivered' | 'failed' | 'retrying';
  responseCode?: number;
  responseBody?: string;
  error?: string;
}

export class WebhookV2Service {
  private readonly logger = new Logger('WebhookV2');
  private readonly retryDelaysSec = [5, 15, 60, 300, 900]; // 5s, 15s, 1m, 5m, 15m

  /**
   * Generates cryptographic HMAC-SHA256 signature for payload verification
   */
  public generateSignature(payload: any, secret: string): string {
    const rawPayload = typeof payload === 'string' ? payload : JSON.stringify(payload);
    const hmac = crypto.createHmac('sha256', secret);
    hmac.update(rawPayload);
    return `sha256=${hmac.digest('hex')}`;
  }

  /**
   * Dispatches a webhook event reliably with auto-retry and signature
   */
  public async dispatch(
    url: string,
    event: string,
    payload: Record<string, any>,
    secret?: string,
  ): Promise<WebhookDeliveryJob> {
    const job: WebhookDeliveryJob = {
      id: uuidv4(),
      url,
      secret,
      event,
      payload,
      attempts: 0,
      maxAttempts: this.retryDelaysSec.length + 1,
      status: 'pending',
    };

    // Attempt delivery asynchronously
    this.executeDelivery(job).catch((err: any) => {
      this.logger.error(`Webhook delivery execution error: ${err?.message || err}`);
    });

    return job;
  }

  private async executeDelivery(job: WebhookDeliveryJob): Promise<void> {
    job.attempts++;
    job.lastAttemptAt = new Date();

    const headers: Record<string, string> = {
      'Content-Type': 'application/json',
      'User-Agent': 'Wox-WhatsApp-Webhook/2.0',
      'X-Wox-Delivery-ID': job.id,
      'X-Wox-Event': job.event,
      'X-Wox-Timestamp': new Date().toISOString(),
    };

    if (job.secret) {
      headers['X-Wox-Signature-256'] = this.generateSignature(job.payload, job.secret);
    }

    try {
      const response = await axios.post(job.url, job.payload, {
        headers,
        timeout: 15000,
        validateStatus: (status) => status >= 200 && status < 300,
      });

      job.status = 'delivered';
      job.responseCode = response.status;
      this.logger.info(`[WebhookV2] Successfully delivered ${job.event} to ${job.url} (Attempt ${job.attempts})`);
    } catch (err: any) {
      job.responseCode = err.response?.status;
      job.error = err.message || 'Request failed';

      if (job.attempts < job.maxAttempts) {
        job.status = 'retrying';
        const delaySeconds = this.retryDelaysSec[job.attempts - 1] || 60;
        job.nextAttemptAt = new Date(Date.now() + delaySeconds * 1000);

        this.logger.warn(
          `[WebhookV2] Delivery failed for ${job.event} to ${job.url}. Retrying in ${delaySeconds}s (Attempt ${job.attempts}/${job.maxAttempts})`,
        );

        setTimeout(() => {
          this.executeDelivery(job);
        }, delaySeconds * 1000);
      } else {
        job.status = 'failed';
        this.logger.error(
          `[WebhookV2] Webhook delivery permanently failed after ${job.attempts} attempts for ${job.event} to ${job.url}`,
        );
      }
    }
  }
}

export const webhookV2Service = new WebhookV2Service();
