import { PrismaRepository } from '@api/repository/repository.service';
import { Logger } from '@config/logger.config';
import { existsSync, mkdirSync, appendFileSync } from 'fs';
import { join } from 'path';

export interface AuditLogEntry {
  userId?: string;
  action: string;
  resource: string;
  resourceId?: string;
  metadata?: Record<string, any>;
  ipAddress?: string;
  userAgent?: string;
  status: 'success' | 'failure';
  timestamp?: Date;
}

export class AuditLogService {
  private readonly logger = new Logger('AuditLogService');
  private readonly auditFilePath = join(process.cwd(), 'store', 'audit-logs.jsonl');

  constructor(private readonly prismaRepository?: PrismaRepository) {
    const storeDir = join(process.cwd(), 'store');
    if (!existsSync(storeDir)) {
      mkdirSync(storeDir, { recursive: true });
    }
  }

  public async log(entry: AuditLogEntry): Promise<void> {
    const enrichedEntry = {
      ...entry,
      timestamp: entry.timestamp || new Date(),
    };

    // 1. Log to structured JSON Lines file in store
    try {
      appendFileSync(this.auditFilePath, JSON.stringify(enrichedEntry) + '\n', 'utf8');
    } catch (err: any) {
      this.logger.error(`Failed to append to audit log file: ${err?.message || err}`);
    }

    // 2. Log to Database if Prisma model exists
    try {
      if (this.prismaRepository && (this.prismaRepository as any).auditLog) {
        await (this.prismaRepository as any).auditLog.create({
          data: {
            userId: enrichedEntry.userId,
            action: enrichedEntry.action,
            resource: enrichedEntry.resource,
            resourceId: enrichedEntry.resourceId,
            metadata: enrichedEntry.metadata || {},
            ipAddress: enrichedEntry.ipAddress || 'unknown',
            userAgent: enrichedEntry.userAgent || 'unknown',
            status: enrichedEntry.status,
            createdAt: enrichedEntry.timestamp,
          },
        });
      }
    } catch (err) {
      // Prisma table might not be migrated yet, fallback cleanly
    }

    this.logger.info(`[AUDIT] ${enrichedEntry.action} on ${enrichedEntry.resource} (${enrichedEntry.status}) by ${enrichedEntry.userId || 'system'}`);
  }
}

export const auditLogService = new AuditLogService();
