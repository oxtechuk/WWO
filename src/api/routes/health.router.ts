import { prismaRepository, waMonitor } from '@api/server.module';
import { redisClient } from '@cache/rediscache.client';
import { Request, Response, Router } from 'express';
import os from 'os';

export function createHealthRouter(): Router {
  const router = Router();

  // Comprehensive System Health & Diagnostics
  router.get('/', async (req: Request, res: Response) => {
    const startTime = Date.now();

    // 1. Database Check
    let dbStatus = 'down';
    let dbLatencyMs = 0;
    try {
      const dbStart = Date.now();
      await (prismaRepository as any).instance.count();
      dbLatencyMs = Date.now() - dbStart;
      dbStatus = 'up';
    } catch (e) {
      dbStatus = 'down';
    }

    // 2. Redis Check
    let redisStatus = 'down';
    let redisLatencyMs = 0;
    try {
      const client = redisClient.getConnection();
      if (client && client.isReady) {
        const rStart = Date.now();
        await client.ping();
        redisLatencyMs = Date.now() - rStart;
        redisStatus = 'up';
      } else {
        redisStatus = 'disabled_or_connecting';
      }
    } catch (e) {
      redisStatus = 'down';
    }

    // 3. WhatsApp Instances Health
    const instances = (waMonitor && waMonitor.waInstances) || {};
    const instanceList = Object.entries(instances);
    const onlineInstances = instanceList.filter(
      ([, inst]) => inst?.connectionStatus?.state === 'open'
    ).length;

    const isHealthy = dbStatus === 'up';
    const totalLatency = Date.now() - startTime;

    const payload = {
      status: isHealthy ? 'healthy' : 'degraded',
      timestamp: new Date().toISOString(),
      uptimeSeconds: Math.floor(process.uptime()),
      system: {
        platform: process.platform,
        nodeVersion: process.version,
        memoryUsageMB: Math.round(process.memoryUsage().heapUsed / 1024 / 1024),
        systemFreeMemoryMB: Math.round(os.freemem() / 1024 / 1024),
        cpuCount: os.cpus().length,
      },
      checks: {
        database: {
          status: dbStatus,
          latencyMs: dbLatencyMs,
        },
        redis: {
          status: redisStatus,
          latencyMs: redisLatencyMs,
        },
        whatsapp: {
          totalInstances: instanceList.length,
          connectedInstances: onlineInstances,
        },
      },
      latencyMs: totalLatency,
    };

    return res.status(isHealthy ? 200 : 503).json(payload);
  });

  // Kubernetes Liveness Probe (is the process running?)
  router.get('/live', (req: Request, res: Response) => {
    return res.status(200).json({ status: 'alive', timestamp: new Date().toISOString() });
  });

  // Kubernetes Readiness Probe (can it take traffic?)
  router.get('/ready', async (req: Request, res: Response) => {
    try {
      await (prismaRepository as any).instance.count();
      return res.status(200).json({ status: 'ready', timestamp: new Date().toISOString() });
    } catch (e) {
      return res.status(503).json({ status: 'not_ready', error: 'Database connection failed' });
    }
  });

  return router;
}
