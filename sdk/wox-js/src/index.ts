import axios, { AxiosInstance } from 'axios';

export interface WoxClientConfig {
  apiKey: string;
  baseUrl?: string;
  instanceName?: string;
  timeoutMs?: number;
}

export interface SendTextMessageParams {
  number: string;
  text: string;
  delay?: number;
  linkPreview?: boolean;
}

export interface SendMediaMessageParams {
  number: string;
  mediatype: 'image' | 'video' | 'audio' | 'document';
  media: string; // URL or Base64
  caption?: string;
  fileName?: string;
  delay?: number;
}

export interface SendTemplateMessageParams {
  number: string;
  templateId: string;
  variables?: Record<string, string | number>;
}

export class WoxClient {
  private readonly http: AxiosInstance;
  public defaultInstance: string;

  constructor(config: WoxClientConfig) {
    this.defaultInstance = config.instanceName || '';
    this.http = axios.create({
      baseURL: config.baseUrl || 'http://localhost:8080',
      timeout: config.timeoutMs || 30000,
      headers: {
        'Content-Type': 'application/json',
        apikey: config.apiKey,
        'User-Agent': 'Wox-Official-SDK/2.3.7',
      },
    });
  }

  public readonly messages = {
    sendText: async (params: SendTextMessageParams, instanceName?: string) => {
      const targetInstance = instanceName || this.defaultInstance;
      if (!targetInstance) throw new Error('instanceName is required');
      const res = await this.http.post(`/message/sendText/${targetInstance}`, params);
      return res.data;
    },

    sendMedia: async (params: SendMediaMessageParams, instanceName?: string) => {
      const targetInstance = instanceName || this.defaultInstance;
      if (!targetInstance) throw new Error('instanceName is required');
      const res = await this.http.post(`/message/sendMedia/${targetInstance}`, params);
      return res.data;
    },

    sendTemplate: async (params: SendTemplateMessageParams, instanceName?: string) => {
      const targetInstance = instanceName || this.defaultInstance;
      if (!targetInstance) throw new Error('instanceName is required');
      const res = await this.http.post(`/message/sendTemplate/${targetInstance}`, params);
      return res.data;
    },
  };

  public readonly instance = {
    getStatus: async (instanceName?: string) => {
      const targetInstance = instanceName || this.defaultInstance;
      if (!targetInstance) throw new Error('instanceName is required');
      const res = await this.http.get(`/instance/connectionState/${targetInstance}`);
      return res.data;
    },

    connect: async (instanceName?: string) => {
      const targetInstance = instanceName || this.defaultInstance;
      if (!targetInstance) throw new Error('instanceName is required');
      const res = await this.http.get(`/instance/connect/${targetInstance}`);
      return res.data;
    },

    logout: async (instanceName?: string) => {
      const targetInstance = instanceName || this.defaultInstance;
      if (!targetInstance) throw new Error('instanceName is required');
      const res = await this.http.delete(`/instance/logout/${targetInstance}`);
      return res.data;
    },
  };

  public readonly health = {
    check: async () => {
      const res = await this.http.get('/health');
      return res.data;
    },
  };
}

export default WoxClient;
