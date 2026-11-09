import { parseSpintax, renderTemplateVariables } from '@utils/antiban.utils';
import { sanitizePhoneNumber } from '@utils/phone.utils';
import { existsSync, mkdirSync, readFileSync, writeFileSync } from 'fs';
import { join } from 'path';

export interface ECommerceEventPayload {
  platform: 'salla' | 'zid' | 'shopify' | 'woocommerce' | 'custom';
  eventType: 'order.created' | 'order.status.updated' | 'abandoned_cart' | 'order.shipped' | string;
  tenantId: string;
  instanceName?: string;
  orderId?: string;
  customerName?: string;
  customerPhone?: string;
  totalAmount?: number | string;
  currency?: string;
  trackingNumber?: string;
  trackingUrl?: string;
  items?: Array<{ name: string; quantity: number; price?: number }>;
  discountCode?: string;
  rawPayload?: any;
}

export interface WebhookProcessingResult {
  success: boolean;
  message: string;
  event: string;
  customerPhone?: string;
  dispatched: boolean;
  messageText?: string;
}

const STORE_DIR = join(process.cwd(), 'store');
const LOGS_FILE = join(STORE_DIR, 'ecommerce-events.json');

function appendEventLog(log: any) {
  try {
    if (!existsSync(STORE_DIR)) {
      mkdirSync(STORE_DIR, { recursive: true });
    }
    let logs: any[] = [];
    if (existsSync(LOGS_FILE)) {
      try {
        logs = JSON.parse(readFileSync(LOGS_FILE, 'utf8'));
      } catch (e) {
        logs = [];
      }
    }
    // Keep latest 200 logs
    logs.unshift(log);
    if (logs.length > 200) logs = logs.slice(0, 200);
    writeFileSync(LOGS_FILE, JSON.stringify(logs, null, 2), 'utf8');
  } catch (err) {
    console.error('Failed to log ecommerce event:', err);
  }
}

export class ECommerceIntegrationService {
  /**
   * Normalizes incoming webhook body from various e-commerce platforms into a unified structure
   */
  public parseWebhook(platform: string, body: any, tenantId: string): ECommerceEventPayload {
    const plat = (platform || '').toLowerCase();

    if (plat === 'salla') {
      const event = body.event || 'order.created';
      const data = body.data || {};
      const customer = data.customer || {};
      const shipping = data.shipping || {};
      return {
        platform: 'salla',
        eventType: event,
        tenantId,
        orderId: String(data.id || data.reference_id || ''),
        customerName: `${customer.first_name || ''} ${customer.last_name || ''}`.trim() || customer.name || 'عميلنا العزيز',
        customerPhone: customer.mobile || customer.phone || '',
        totalAmount: data.amounts?.total?.amount || data.total?.amount || data.total || 0,
        currency: data.amounts?.total?.currency || data.currency || 'SAR',
        trackingNumber: shipping.shipment_number || shipping.tracking_number || '',
        trackingUrl: shipping.tracking_link || '',
        rawPayload: body,
      };
    }

    if (plat === 'zid') {
      const event = body.event || 'order.create';
      const order = body.order || body.payload || body;
      const customer = order.customer || {};
      return {
        platform: 'zid',
        eventType: event,
        tenantId,
        orderId: String(order.id || ''),
        customerName: customer.name || 'عميلنا العزيز',
        customerPhone: customer.mobile || customer.phone || '',
        totalAmount: order.order_total || order.total || 0,
        currency: order.currency_code || 'SAR',
        trackingNumber: order.tracking_number || '',
        trackingUrl: order.tracking_url || '',
        rawPayload: body,
      };
    }

    if (plat === 'shopify') {
      const customer = body.customer || {};
      const shipping = (body.fulfillments && body.fulfillments[0]) || {};
      return {
        platform: 'shopify',
        eventType: body.financial_status ? 'order.created' : 'cart.abandoned',
        tenantId,
        orderId: String(body.order_number || body.id || ''),
        customerName: `${customer.first_name || ''} ${customer.last_name || ''}`.trim() || 'عميلنا العزيز',
        customerPhone: customer.phone || body.phone || '',
        totalAmount: body.current_total_price || body.total_price || 0,
        currency: body.currency || 'SAR',
        trackingNumber: shipping.tracking_number || '',
        trackingUrl: shipping.tracking_url || '',
        rawPayload: body,
      };
    }

    // Default / Custom Webhook format
    return {
      platform: 'custom',
      eventType: body.event || 'order.created',
      tenantId,
      orderId: String(body.orderId || body.order_id || ''),
      customerName: body.customerName || body.name || 'عميلنا العزيز',
      customerPhone: body.customerPhone || body.phone || body.mobile || '',
      totalAmount: body.totalAmount || body.total || 0,
      currency: body.currency || 'SAR',
      trackingNumber: body.trackingNumber || '',
      trackingUrl: body.trackingUrl || '',
      discountCode: body.discountCode || '',
      rawPayload: body,
    };
  }

  /**
   * Generates localized Arabic notification message tailored for Saudi & Egyptian consumers
   */
  public generateNotificationText(event: ECommerceEventPayload): string {
    const isEgypt = event.currency === 'EGP';
    const currencyStr = isEgypt ? 'ج.م' : 'ر.س';

    if (event.eventType.includes('abandoned') || event.eventType.includes('cart')) {
      return parseSpintax(
        `{مرحباً|أهلاً بك|السلام عليكم} يا ${event.customerName} 👋\n\n` +
        `لاحظنا أنك تركت بعض المنتجات الرائعة في سلتك ولم تكمل الطلب!\n\n` +
        `🎁 {يسرنا أن نقدم لك|استخدم كود|كود خصم حصري لك}: *${event.discountCode || 'SAVE10'}* للحصول على خصم خاص.\n\n` +
        `اضغط هنا لإتمام طلبك بكل سهولة قبل نفاد الكمية! ✨`
      );
    }

    if (event.eventType.includes('ship') || event.trackingNumber) {
      return parseSpintax(
        `{أهلاً بك|مرحباً|السلام عليكم} يا ${event.customerName} 🚚\n\n` +
        `تم شحن طلبك رقم *#${event.orderId}* بنجاح وهو الآن في طريقه إليك!\n\n` +
        (event.trackingNumber ? `📦 رقم الشحنة والتتبع: *${event.trackingNumber}*\n` : '') +
        (event.trackingUrl ? `🔗 رابط التتبع المباشر: ${event.trackingUrl}\n\n` : '\n') +
        `نشكرك على ثقتك وتسوقك معنا ✨`
      );
    }

    // Default: Order Confirmed
    return parseSpintax(
      `{أهلاً بك|مرحباً|السلام عليكم} يا ${event.customerName} 🎉\n\n` +
      `تم استلام وتأكيد طلبك رقم *#${event.orderId}* بنجاح.\n\n` +
      `💰 الإجمالي: *${event.totalAmount} ${currencyStr}*\n` +
      `جاري تجهيز الشحنة بعناية وسنوافيك بتحديث الشحن فور انطلاق المندوب.\n\n` +
      `لأي استفسار، يسعدنا تواصلك معنا دائماً! 🌹`
    );
  }

  /**
   * Processes the parsed event, normalizes destination phone, and dispatches via WhatsApp instance if available
   */
  public async handleWebhook(event: ECommerceEventPayload, activeInstanceName?: string): Promise<WebhookProcessingResult> {
    const defaultCountry = event.currency === 'EGP' ? 'EG' : 'SA';
    const phoneSanitized = sanitizePhoneNumber(event.customerPhone || '', defaultCountry);

    const messageText = this.generateNotificationText(event);

    let dispatched = false;

    if (phoneSanitized.isValid && activeInstanceName) {
      try {
        const { sendMessageController } = require('@api/server.module');
        if (sendMessageController && typeof sendMessageController.sendText === 'function') {
          await sendMessageController.sendText(
            { instanceName: activeInstanceName },
            {
              number: phoneSanitized.sanitized,
              text: messageText,
              delay: Math.floor(Math.random() * 2000) + 1000,
            } as any
          );
          dispatched = true;
        }
      } catch (err: any) {
        console.warn(`[ECommerce] Auto-dispatch failed for instance ${activeInstanceName}:`, err.message);
      }
    }

    const logEntry = {
      timestamp: new Date().toISOString(),
      platform: event.platform,
      eventType: event.eventType,
      orderId: event.orderId,
      customerName: event.customerName,
      customerPhone: phoneSanitized.sanitized,
      dispatched,
      instanceName: activeInstanceName || null,
      messageText,
    };

    appendEventLog(logEntry);

    return {
      success: true,
      message: dispatched ? 'تمت معالجة الويب هوك وإرسال إشعار الواتساب بنجاح' : 'تم استلام الويب هوك وتخزينه في السجلات',
      event: event.eventType,
      customerPhone: phoneSanitized.sanitized,
      dispatched,
      messageText,
    };
  }

  public getRecentLogs(): any[] {
    try {
      if (existsSync(LOGS_FILE)) {
        return JSON.parse(readFileSync(LOGS_FILE, 'utf8'));
      }
    } catch (e) {}
    return [];
  }
}

export const eCommerceIntegrationService = new ECommerceIntegrationService();
