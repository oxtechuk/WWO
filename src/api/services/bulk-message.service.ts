import { waMonitor } from '@api/server.module';
import { Logger } from '@config/logger.config';
import { v4 as uuidv4 } from 'uuid';

export interface BulkMessageItem {
  number: string;
  text?: string;
  mediaUrl?: string;
  caption?: string;
  templateId?: string;
  customParams?: Record<string, any>;
}

export interface BulkCampaign {
  id: string;
  instanceName: string;
  campaignName: string;
  status: 'queued' | 'running' | 'paused' | 'completed' | 'failed' | 'cancelled';
  totalMessages: number;
  sentCount: number;
  failedCount: number;
  delayRangeSec: [number, number]; // [min, max] for randomized anti-ban intervals
  items: Array<BulkMessageItem & { status: 'pending' | 'sent' | 'failed'; error?: string }>;
  createdAt: Date;
  startedAt?: Date;
  completedAt?: Date;
}

export class BulkMessageService {
  private readonly logger = new Logger('BulkMessageService');
  private campaigns = new Map<string, BulkCampaign>();

  /**
   * Enqueues a new bulk messaging campaign
   */
  public createCampaign(params: {
    instanceName: string;
    campaignName: string;
    items: BulkMessageItem[];
    delayRangeSec?: [number, number];
  }): BulkCampaign {
    const campaignId = uuidv4();
    const campaign: BulkCampaign = {
      id: campaignId,
      instanceName: params.instanceName,
      campaignName: params.campaignName,
      status: 'queued',
      totalMessages: params.items.length,
      sentCount: 0,
      failedCount: 0,
      delayRangeSec: params.delayRangeSec || [3, 8],
      items: params.items.map((item) => ({ ...item, status: 'pending' })),
      createdAt: new Date(),
    };

    this.campaigns.set(campaignId, campaign);
    this.startCampaign(campaignId).catch((err: any) => {
      this.logger.error(`Failed to process campaign ${campaignId}: ${err?.message || err}`);
    });

    return campaign;
  }

  public getCampaign(campaignId: string): BulkCampaign | undefined {
    return this.campaigns.get(campaignId);
  }

  public listCampaigns(instanceName?: string): BulkCampaign[] {
    const list = Array.from(this.campaigns.values());
    if (instanceName) {
      return list.filter((c) => c.instanceName === instanceName);
    }
    return list;
  }

  public cancelCampaign(campaignId: string): boolean {
    const campaign = this.campaigns.get(campaignId);
    if (campaign && (campaign.status === 'running' || campaign.status === 'queued')) {
      campaign.status = 'cancelled';
      return true;
    }
    return false;
  }

  private async startCampaign(campaignId: string): Promise<void> {
    const campaign = this.campaigns.get(campaignId);
    if (!campaign) return;

    campaign.status = 'running';
    campaign.startedAt = new Date();
    this.logger.info(`[BulkMessage] Started campaign "${campaign.campaignName}" with ${campaign.totalMessages} messages.`);

    const waInstance = waMonitor?.waInstances?.[campaign.instanceName];
    if (!waInstance) {
      campaign.status = 'failed';
      this.logger.error(`[BulkMessage] Instance ${campaign.instanceName} not found.`);
      return;
    }

    for (let i = 0; i < campaign.items.length; i++) {
      if ((campaign.status as string) === 'cancelled') {
        this.logger.warn(`[BulkMessage] Campaign ${campaignId} cancelled by user.`);
        break;
      }

      const item = campaign.items[i];
      try {
        // Send message via instance
        if (item.text) {
          await waInstance.sendTextMessage({
            number: item.number,
            textMessage: { text: item.text },
          });
        }

        item.status = 'sent';
        campaign.sentCount++;
      } catch (err: any) {
        item.status = 'failed';
        item.error = err?.message || 'Send error';
        campaign.failedCount++;
        this.logger.warn(`[BulkMessage] Message to ${item.number} failed: ${item.error}`);
      }

      // Random jitter delay for anti-ban human imitation
      if (i < campaign.items.length - 1) {
        const [min, max] = campaign.delayRangeSec;
        const delayMs = Math.floor((Math.random() * (max - min) + min) * 1000);
        await new Promise((resolve) => setTimeout(resolve, delayMs));
      }
    }

    if ((campaign.status as string) !== 'cancelled') {
      campaign.status = 'completed';
    }
    campaign.completedAt = new Date();
    this.logger.info(
      `[BulkMessage] Campaign ${campaign.campaignName} finished: ${campaign.sentCount} sent, ${campaign.failedCount} failed.`,
    );
  }
}

export const bulkMessageService = new BulkMessageService();
