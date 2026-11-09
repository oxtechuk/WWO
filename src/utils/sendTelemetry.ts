import { configService, Telemetry } from '@config/env.config';
import axios from 'axios';
import fs from 'fs';

const packageJson = JSON.parse(fs.readFileSync('./package.json', 'utf8'));

export interface TelemetryData {
  route: string;
  apiVersion: string;
  timestamp: Date;
}

export const sendTelemetry = async (_route: string): Promise<void> => {
  // Telemetry disabled for Wox WhatsApp
  return;
};
