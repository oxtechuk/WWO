import { createRedisRateLimiter } from '@api/guards/redis-rate-limiter';
import { PrismaRepository } from '@api/repository/repository.service';
import { auditLogService } from '@api/services/audit-log.service';
import {
  comparePassword,
  generateOtp,
  generateTokens,
  hashPassword,
  validatePasswordStrength,
  verifyAccessToken,
  verifyRefreshToken,
} from '@utils/security.utils';
import { eCommerceIntegrationService } from '@api/services/ecommerce-integration.service';
import { Request, Response, Router } from 'express';
import { existsSync, mkdirSync, readFileSync, writeFileSync } from 'fs';
import { join } from 'path';

// Analytics persistent config file path
const ANALYTICS_CONFIG_PATH = join(process.cwd(), 'store', 'analytics-config.json');

function getAnalyticsConfig() {
  try {
    if (existsSync(ANALYTICS_CONFIG_PATH)) {
      return JSON.parse(readFileSync(ANALYTICS_CONFIG_PATH, 'utf8'));
    }
  } catch (err) {
    // fallback to defaults
  }
  return {
    gaMeasurementId: process.env.GA_MEASUREMENT_ID || 'G-WOXWHATSAPP',
    metaPixelId: process.env.META_PIXEL_ID || '123456789012345',
    snapchatPixelId: process.env.SNAP_PIXEL_ID || 'snap-wox-saudi-001',
    tiktokPixelId: process.env.TIKTOK_PIXEL_ID || 'tt-wox-ecommerce-001',
    googleTagManagerId: process.env.GTM_ID || '',
    enabled: true,
  };
}

function saveAnalyticsConfig(config: any) {
  try {
    const storeDir = join(process.cwd(), 'store');
    if (!existsSync(storeDir)) mkdirSync(storeDir, { recursive: true });
    writeFileSync(ANALYTICS_CONFIG_PATH, JSON.stringify(config, null, 2), 'utf8');
  } catch (err) {
    console.error('Failed to save analytics config to disk:', err);
  }
}

// Site & SEO persistent config file path
const SITE_SETTINGS_PATH = join(process.cwd(), 'store', 'site-settings.json');

function getSiteSettings() {
  try {
    if (existsSync(SITE_SETTINGS_PATH)) {
      return JSON.parse(readFileSync(SITE_SETTINGS_PATH, 'utf8'));
    }
  } catch (err) {
    // fallback to defaults
  }
  return {
    siteName: 'Wox WhatsApp',
    siteTagline: 'بوابة إرسال رسائل الواتساب والربط السحابي للمتاجر والشركات',
    logoUrl: '/images/wox-logo.svg',
    logoDarkUrl: '/images/wox-logo-dark.svg',
    faviconUrl: '/favicon.ico',
    seoTitle: 'Wox WhatsApp | بوابة الواتساب السحابية وحلول الربط الذكي',
    seoDescription: 'المنصة الرائدة لربط الواتساب بمتجرك وووكومرس وتطبيقاتك: إشعارات الطلبات اللحظية، استرجاع السلات المتروكة، بوتات ذكاء اصطناعي وأرقام افتراضية.',
    seoKeywords: 'واتساب, ووكومرس, ربط واتساب, سلات متروكة, تسويق واتساب, لارافيل, wox, whatsapp api',
    ogImageUrl: '/images/wox-og-cover.png',
    canonicalUrl: process.env.SERVER_URL || 'http://localhost:8080',
    robots: 'index, follow',
    contactEmail: 'support@oxtech.com',
    contactPhone: '+966500000000',
    footerText: 'جميع الحقوق محفوظة © Wox WhatsApp - إحدى منصات Ox Tech',
    customHeaderCode: '',
    customFooterCode: '',
    heroVideoUrl: '',
    heroVideoPlacement: 'full', // 'full' (inside mockup container) or 'sidebar'
    heroVideoAutoplay: true,
  };
}

function saveSiteSettings(settings: any) {
  try {
    const storeDir = join(process.cwd(), 'store');
    if (!existsSync(storeDir)) mkdirSync(storeDir, { recursive: true });
    writeFileSync(SITE_SETTINGS_PATH, JSON.stringify(settings, null, 2), 'utf8');
  } catch (err) {
    console.error('Failed to save site settings to disk:', err);
  }
}

// Tenant data persistent storage helpers
function getTenantStorePath(tenantId: string): string {
  const storeDir = join(process.cwd(), 'store');
  if (!existsSync(storeDir)) mkdirSync(storeDir, { recursive: true });
  const safeId = (tenantId || 'default').replace(/[^a-zA-Z0-9_-]/g, '');
  return join(storeDir, `tenant-${safeId}.json`);
}

function getTenantData(tenantId: string) {
  const file = getTenantStorePath(tenantId);
  try {
    if (existsSync(file)) {
      return JSON.parse(readFileSync(file, 'utf8'));
    }
  } catch (e) {}
  return {
    templates: [
      { id: '1', code: 'order_confirmation', title: 'تأكيد الطلب', text: 'تم تأكيد طلبك رقم {{order_id}} بنجاح، جاري التجهيز للشحن.' },
      { id: '2', code: 'order_shipped', title: 'تم الشحن', text: 'تم شحن طلبك رقم {{order_id}}، كود التتبع: {{tracking_number}}' },
      { id: '3', code: 'abandoned_cart', title: 'استعادة السلة المتروكة', text: 'أهلاً بك {{name}}، نسيت بعض المنتجات في سلتك! استخدم كود {{discount_code}} لتحصل على خصم خاص.' },
      { id: '4', code: 'review_request', title: 'طلب تقييم', text: 'نود معرفة رأيك في تجربتك معنا! يرجى تقييم الطلب عبر الرابط: {{link}}' },
      { id: '5', code: 'promo_offer', title: 'عروض خاصة', text: 'عروضنا الحصرية لفترة محدودة! استخدم كود {{discount_code}} لتحصل على خصم {{discount_percent}}%' },
      { id: '6', code: 'payment_reminder', title: 'تذكير بالدفع', text: 'مرحباً {{name}}، نود تذكيرك بموعد سداد فاتورة رقم {{invoice_number}} بمبلغ {{amount}} ر.س.' },
    ],
    contacts: [
      { id: '1', name: 'أحمد العتيبي', phone: '+966 50 123 4567', tag: 'VIP', country: 'SA', date: '2026-09-10' },
      { id: '2', name: 'Sara Mohamed', phone: '+20 100 234 5678', tag: 'متجر', country: 'EG', date: '2026-09-08' },
      { id: '3', name: 'محمد الشهري', phone: '+966 55 987 6543', tag: 'VIP', country: 'SA', date: '2026-09-05' },
      { id: '4', name: 'Noha Khaled', phone: '+20 111 876 5432', tag: 'lead', country: 'EG', date: '2026-09-02' },
    ],
    automationRules: [
      { id: '1', keyword: 'السعر', match: 'يحتوي', reply: 'أسعار باقاتنا تبدأ من 99 ر.س شهرياً، يمكنك الاطلاع على العروض عبر متجرنا.', active: true },
      { id: '2', keyword: 'مرحبا', match: 'يحتوي', reply: 'أهلاً بك في منصة Wox! كيف يمكن لفريقنا مساعدتك اليوم؟', active: true },
      { id: '3', keyword: 'طلب', match: 'يحتوي', reply: 'لتتبع طلبك، يرجى تزويدنا برقم الشحنة أو رقم الهاتف المسجل.', active: true },
      { id: '4', keyword: 'دعم', match: 'تطابق تام', reply: 'تم تحويلك إلى فريق خدمة العملاء المباشر، سيتواصل معك أحد ممثلينا فوراً.', active: true },
    ],
  };
}

function saveTenantData(tenantId: string, data: any) {
  try {
    const file = getTenantStorePath(tenantId);
    writeFileSync(file, JSON.stringify(data, null, 2), 'utf8');
  } catch (err) {
    console.error('Failed to save tenant data:', err);
  }
}

export function createSaasRouter(prisma: PrismaRepository): Router {
  const router = Router();

  // Rate limiter for authentication routes: max 15 attempts per 15 minutes with Redis & Memory fallback
  const authRateLimiter = createRedisRateLimiter({
    windowMs: 15 * 60 * 1000,
    max: 15,
    keyPrefix: 'saas_auth',
    message: 'تم تجاوز الحد الأقصى لمحاولات الدخول. يرجى الانتظار 15 دقيقة والمحاولة لاحقاً لحماية حسابك.',
  });

  // 1. Get all public plans
  router.get('/plans', async (req: Request, res: Response) => {
    try {
      const plans = await prisma.plan.findMany({
        orderBy: { priceSAR: 'asc' },
      });
      return res.json({ status: 'success', data: plans });
    } catch (error: any) {
      return res.status(500).json({ status: 'error', message: error.message });
    }
  });

  // 2. User Registration (SaaS Sign Up with bcrypt hashing & JWT tokens)
  router.post('/auth/register', authRateLimiter, async (req: Request, res: Response) => {
    try {
      const { name, email, password, phone, companyName, country = 'SA' } = req.body;

      if (!email || !password || !name) {
        return res.status(400).json({ status: 'error', message: 'الاسم، البريد الإلكتروني، وكلمة المرور مطلوبة' });
      }

      // Validate password strength
      const passCheck = validatePasswordStrength(password);
      if (!passCheck.valid) {
        return res.status(400).json({ status: 'error', message: passCheck.message });
      }

      const existingUser = await prisma.user.findUnique({ where: { email } });
      if (existingUser) {
        return res.status(409).json({ status: 'error', message: 'البريد الإلكتروني مسجل بالفعل' });
      }

      // Hash password with bcryptjs
      const hashedPassword = await hashPassword(password);

      const currency = country === 'EG' ? 'EGP' : country === 'SA' ? 'SAR' : 'USD';

      // Create Tenant
      const tenant = await prisma.tenant.create({
        data: {
          name: companyName || `${name}'s Workspace`,
          country,
          currency,
        },
      });

      // Create User with hashed password
      const user = await prisma.user.create({
        data: {
          name,
          email,
          password: hashedPassword,
          phone,
          role: 'CLIENT',
          tenantId: tenant.id,
        },
      });

      // Assign default Starter plan as 14-day free trial
      const starterPlan = await prisma.plan.findFirst({ where: { name: 'Starter' } });
      if (starterPlan) {
        const endDate = new Date();
        endDate.setDate(endDate.getDate() + 14); // 14 days trial

        await prisma.subscription.create({
          data: {
            tenantId: tenant.id,
            planId: starterPlan.id,
            status: 'TRIAL',
            endDate,
          },
        });
      }

      // Generate JWT Access & Refresh tokens
      const tokens = generateTokens({
        userId: user.id,
        tenantId: tenant.id,
        role: user.role,
      });

      return res.status(201).json({
        status: 'success',
        message: 'تم تسجيل الحساب بنجاح وتفعيل التجربة المجانية لمدة 14 يوماً!',
        data: {
          user: { id: user.id, name: user.name, email: user.email, role: user.role, phone: user.phone },
          tenant: { id: tenant.id, name: tenant.name, country: tenant.country, currency: tenant.currency },
          tokens,
        },
      });
    } catch (error: any) {
      return res.status(500).json({ status: 'error', message: error.message });
    }
  });

  // 3. User Login (with bcrypt comparison, tenant freeze verification, & JWT tokens)
  router.post('/auth/login', authRateLimiter, async (req: Request, res: Response) => {
    try {
      const { email, password } = req.body;

      if (!email || !password) {
        return res.status(400).json({ status: 'error', message: 'البريد الإلكتروني وكلمة المرور مطلوبة' });
      }

      const user = await prisma.user.findUnique({
        where: { email },
        include: {
          tenant: {
            include: {
              subscription: {
                include: { plan: true },
              },
            },
          },
        },
      });

      if (!user) {
        return res.status(401).json({ status: 'error', message: 'بيانات الدخول غير صحيحة' });
      }

      // Verify bcrypt password hash (with plain fallback for initial seeds)
      const isValid = await comparePassword(password, user.password);
      if (!isValid) {
        return res.status(401).json({ status: 'error', message: 'بيانات الدخول غير صحيحة' });
      }

      // Check if tenant account is frozen
      if (user.tenant?.subscription?.status === 'CANCELLED') {
        return res.status(403).json({
          status: 'error',
          code: 'ACCOUNT_FROZEN',
          message: 'تم تجميد حساب المنشأة من قبل الإدارة. يرجى التواصل مع الدعم الفني.',
        });
      }

      // Generate JWT Access & Refresh tokens
      const tokens = generateTokens({
        userId: user.id,
        tenantId: user.tenantId || undefined,
        role: user.role,
      });

      return res.json({
        status: 'success',
        message: 'تم تسجيل الدخول بنجاح',
        data: {
          user: {
            id: user.id,
            name: user.name,
            email: user.email,
            role: user.role,
            phone: user.phone,
          },
          tenant: user.tenant,
          tokens,
        },
      });
    } catch (error: any) {
      return res.status(500).json({ status: 'error', message: error.message });
    }
  });

  // 3.1 Token Refresh endpoint
  router.post('/auth/refresh', async (req: Request, res: Response) => {
    try {
      const { refreshToken } = req.body;
      if (!refreshToken) {
        return res.status(400).json({ status: 'error', message: 'رمز التجديد (refreshToken) مطلوب' });
      }

      const decoded = verifyRefreshToken(refreshToken);
      if (!decoded) {
        return res.status(401).json({ status: 'error', message: 'رمز التجديد غير صالح أو منتهي الصلاحية' });
      }

      const user = await prisma.user.findUnique({ where: { id: decoded.userId } });
      if (!user) {
        return res.status(404).json({ status: 'error', message: 'المستخدم غير موجود' });
      }

      const tokens = generateTokens({
        userId: user.id,
        tenantId: user.tenantId || undefined,
        role: user.role,
      });

      return res.json({ status: 'success', data: { tokens } });
    } catch (error: any) {
      return res.status(500).json({ status: 'error', message: error.message });
    }
  });

  // 3.2 Get Current Authenticated User (JWT Token Guard)
  router.get('/auth/me', async (req: Request, res: Response) => {
    try {
      const authHeader = req.headers.authorization;
      if (!authHeader || !authHeader.startsWith('Bearer ')) {
        return res.status(401).json({ status: 'error', message: 'غير مصرح - يلزم توفر Bearer Token' });
      }

      const token = authHeader.split(' ')[1];
      const payload = verifyAccessToken(token);
      if (!payload) {
        return res.status(401).json({ status: 'error', message: 'التوكن منتهي الصلاحية أو غير صالح' });
      }

      const user = await prisma.user.findUnique({
        where: { id: payload.userId },
        select: {
          id: true,
          name: true,
          email: true,
          role: true,
          phone: true,
          tenant: {
            include: {
              subscription: { include: { plan: true } },
            },
          },
        },
      });

      if (!user) {
        return res.status(404).json({ status: 'error', message: 'المستخدم غير موجود' });
      }

      return res.json({ status: 'success', data: user });
    } catch (error: any) {
      return res.status(500).json({ status: 'error', message: error.message });
    }
  });

  // Analytics Config Routes
  router.get('/analytics/config', (req: Request, res: Response) => {
    return res.json({ status: 'success', data: getAnalyticsConfig() });
  });

  router.post('/analytics/config', (req: Request, res: Response) => {
    try {
      const { gaMeasurementId, metaPixelId, snapchatPixelId, tiktokPixelId, googleTagManagerId, enabled } = req.body;
      const current = getAnalyticsConfig();

      const updated = {
        gaMeasurementId: gaMeasurementId !== undefined ? gaMeasurementId : current.gaMeasurementId,
        metaPixelId: metaPixelId !== undefined ? metaPixelId : current.metaPixelId,
        snapchatPixelId: snapchatPixelId !== undefined ? snapchatPixelId : current.snapchatPixelId,
        tiktokPixelId: tiktokPixelId !== undefined ? tiktokPixelId : current.tiktokPixelId,
        googleTagManagerId: googleTagManagerId !== undefined ? googleTagManagerId : current.googleTagManagerId,
        enabled: enabled !== undefined ? Boolean(enabled) : current.enabled,
      };

      saveAnalyticsConfig(updated);
      return res.json({ status: 'success', message: 'تم تحديث إعدادات التتبع والبكسل بنجاح', data: updated });
    } catch (error: any) {
      return res.status(500).json({ status: 'error', message: error.message });
    }
  });

  // Site & SEO Settings Routes
  router.get('/site-settings', (req: Request, res: Response) => {
    return res.json({ status: 'success', data: getSiteSettings() });
  });

  router.post('/site-settings', (req: Request, res: Response) => {
    try {
      const current = getSiteSettings();
      const updated = {
        ...current,
        ...req.body,
      };
      saveSiteSettings(updated);
      return res.json({ status: 'success', message: 'تم حفظ إعدادات الموقع، اللوجو و SEO بنجاح', data: updated });
    } catch (error: any) {
      return res.status(500).json({ status: 'error', message: error.message });
    }
  });

  // Media & Image Upload Route (Base64 file upload for logos, videos, favicons, OG images)
  const handleMediaUpload = (req: Request, res: Response) => {
    try {
      const { fileName, base64 } = req.body;
      if (!base64) {
        return res.status(400).json({ status: 'error', message: 'لم يتم إرسال بيانات الملف' });
      }

      // Extract format & binary
      const matches = base64.match(/^data:([A-Za-z0-9-+\/]+);base64,(.+)$/);
      let ext = 'png';
      let buffer: Buffer;

      if (matches && matches.length === 3) {
        const mime = matches[1].toLowerCase();
        if (mime.includes('svg')) ext = 'svg';
        else if (mime.includes('jpeg') || mime.includes('jpg')) ext = 'jpg';
        else if (mime.includes('webp')) ext = 'webp';
        else if (mime.includes('ico') || mime.includes('x-icon')) ext = 'ico';
        else if (mime.includes('mp4')) ext = 'mp4';
        else if (mime.includes('webm')) ext = 'webm';
        else if (mime.includes('ogg')) ext = 'ogg';
        else if (mime.includes('quicktime') || mime.includes('mov')) ext = 'mov';
        else if (mime.includes('gif')) ext = 'gif';
        buffer = Buffer.from(matches[2], 'base64');
      } else {
        buffer = Buffer.from(base64, 'base64');
      }

      // Fallback extension from filename
      if (fileName && fileName.includes('.')) {
        const parts = fileName.split('.');
        const fileExt = parts[parts.length - 1].toLowerCase().replace(/[^a-z0-9]/g, '');
        if (['mp4', 'webm', 'ogg', 'mov', 'png', 'jpg', 'jpeg', 'svg', 'ico', 'webp', 'gif'].includes(fileExt)) {
          ext = fileExt === 'jpeg' ? 'jpg' : fileExt;
        }
      }

      const uploadsDir = join(process.cwd(), 'public', 'uploads');
      if (!existsSync(uploadsDir)) mkdirSync(uploadsDir, { recursive: true });

      const cleanBase = (fileName || 'media')
        .replace(/\.[^/.]+$/, '')
        .replace(/[^a-zA-Z0-9_-]/g, '')
        .slice(0, 30) || 'upload';

      const finalName = `${cleanBase}-${Date.now()}.${ext}`;
      const filePath = join(uploadsDir, finalName);

      writeFileSync(filePath, buffer);

      const publicUrl = `/uploads/${finalName}`;
      return res.json({ status: 'success', url: publicUrl, message: 'تم رفع الملف بنجاح' });
    } catch (err: any) {
      console.error('Media upload error:', err);
      return res.status(500).json({ status: 'error', message: err.message || 'فشل رفع الملف' });
    }
  };

  router.post('/upload-image', handleMediaUpload);
  router.post('/upload-media', handleMediaUpload);

  // 4. Virtual Numbers list
  router.get('/numbers', async (req: Request, res: Response) => {
    try {
      const { country } = req.query;
      const whereClause: any = { status: 'AVAILABLE' };
      if (country) whereClause.country = String(country);

      const numbers = await prisma.virtualNumber.findMany({
        where: whereClause,
      });

      return res.json({ status: 'success', data: numbers });
    } catch (error: any) {
      return res.status(500).json({ status: 'error', message: error.message });
    }
  });

  // 5. Purchase / Assign Virtual Number
  router.post('/numbers/purchase', async (req: Request, res: Response) => {
    try {
      const { numberId, tenantId } = req.body;
      if (!numberId || !tenantId) {
        return res.status(400).json({ status: 'error', message: 'numberId and tenantId are required' });
      }

      const virtualNumber = await prisma.virtualNumber.findUnique({ where: { id: numberId } });
      if (!virtualNumber || virtualNumber.status !== 'AVAILABLE') {
        return res.status(400).json({ status: 'error', message: 'Number is not available' });
      }

      const updated = await prisma.virtualNumber.update({
        where: { id: numberId },
        data: {
          status: 'ACTIVE',
          tenantId,
        },
      });

      return res.json({
        status: 'success',
        message: `Number ${updated.number} successfully assigned to workspace!`,
        data: updated,
      });
    } catch (error: any) {
      return res.status(500).json({ status: 'error', message: error.message });
    }
  });

  // 6. Super Admin Overview
  router.get('/admin/overview', async (req: Request, res: Response) => {
    try {
      const totalTenants = await prisma.tenant.count();
      const totalUsers = await prisma.user.count();
      const activeSubscriptions = await prisma.subscription.count({
        where: { status: { in: ['ACTIVE', 'TRIAL'] } },
      });
      const subscriptions = await prisma.subscription.findMany({
        include: { plan: true },
      });

      const totalRevenueSAR = subscriptions.reduce((sum, sub) => sum + (sub.plan?.priceSAR || 0), 0);
      const totalRevenueEGP = subscriptions.reduce((sum, sub) => sum + (sub.plan?.priceEGP || 0), 0);
      const totalNumbers = await prisma.virtualNumber.count();
      const assignedNumbers = await prisma.virtualNumber.count({ where: { status: 'ACTIVE' } });

      return res.json({
        status: 'success',
        data: {
          totalTenants,
          totalUsers,
          activeSubscriptions,
          estimatedMonthlyRevenueSAR: totalRevenueSAR,
          estimatedMonthlyRevenueEGP: totalRevenueEGP,
          totalNumbers,
          assignedNumbers,
          serverMemoryUsage: `${Math.round(process.memoryUsage().heapUsed / 1024 / 1024)} MB`,
          uptimeHours: (process.uptime() / 3600).toFixed(1),
        },
      });
    } catch (error: any) {
      return res.status(500).json({ status: 'error', message: error.message });
    }
  });

  // 7. Super Admin: List all tenants
  router.get('/admin/tenants', async (req: Request, res: Response) => {
    try {
      const tenants = await prisma.tenant.findMany({
        include: {
          users: { select: { id: true, name: true, email: true, role: true, phone: true } },
          subscription: { include: { plan: true } },
          virtualNumbers: true,
          invoices: true,
        },
        orderBy: { createdAt: 'desc' },
      });
      return res.json({ status: 'success', data: tenants });
    } catch (error: any) {
      return res.status(500).json({ status: 'error', message: error.message });
    }
  });

  // 8. Super Admin: Update tenant status (ACTIVE / CANCELLED)
  router.post('/admin/tenants/:id/status', async (req: Request, res: Response) => {
    try {
      const { id } = req.params;
      const { status } = req.body; // 'ACTIVE', 'CANCELLED', 'TRIAL'
      
      const sub = await prisma.subscription.findUnique({ where: { tenantId: id } });
      if (!sub) {
        return res.status(404).json({ status: 'error', message: 'Subscription not found for this tenant' });
      }

      const updated = await prisma.subscription.update({
        where: { tenantId: id },
        data: { status: status as any },
      });

      return res.json({ status: 'success', message: 'Tenant subscription status updated', data: updated });
    } catch (error: any) {
      return res.status(500).json({ status: 'error', message: error.message });
    }
  });

  // 9. Super Admin: Upgrade/Change tenant plan
  router.post('/admin/tenants/:id/upgrade', async (req: Request, res: Response) => {
    try {
      const { id } = req.params;
      const { planId } = req.body;

      const plan = await prisma.plan.findUnique({ where: { id: planId } });
      if (!plan) {
        return res.status(404).json({ status: 'error', message: 'Plan not found' });
      }

      const updated = await prisma.subscription.upsert({
        where: { tenantId: id },
        update: { planId, status: 'ACTIVE' },
        create: { tenantId: id, planId, status: 'ACTIVE' },
      });

      return res.json({ status: 'success', message: `Tenant plan upgraded to ${plan.name}`, data: updated });
    } catch (error: any) {
      return res.status(500).json({ status: 'error', message: error.message });
    }
  });

  // 10. Super Admin: Update plan pricing & limits
  router.post('/admin/plans/update', async (req: Request, res: Response) => {
    try {
      const { id, nameAr, priceSAR, priceEGP, instanceLimit, messageLimit, aiBotsLimit } = req.body;
      if (!id) {
        return res.status(400).json({ status: 'error', message: 'Plan id is required' });
      }

      const updated = await prisma.plan.update({
        where: { id },
        data: {
          nameAr: nameAr !== undefined ? nameAr : undefined,
          priceSAR: priceSAR !== undefined ? Number(priceSAR) : undefined,
          priceEGP: priceEGP !== undefined ? Number(priceEGP) : undefined,
          instanceLimit: instanceLimit !== undefined ? Number(instanceLimit) : undefined,
          messageLimit: messageLimit !== undefined ? Number(messageLimit) : undefined,
          aiBotsLimit: aiBotsLimit !== undefined ? Number(aiBotsLimit) : undefined,
        },
      });

      return res.json({ status: 'success', message: `Plan ${updated.name} updated successfully`, data: updated });
    } catch (error: any) {
      return res.status(500).json({ status: 'error', message: error.message });
    }
  });

  // 11. Super Admin: Create new plan
  router.post('/admin/plans/create', async (req: Request, res: Response) => {
    try {
      const { name, nameAr, description, priceSAR, priceEGP, priceUSD = 0, instanceLimit, messageLimit, aiBotsLimit } = req.body;
      if (!name || !nameAr) {
        return res.status(400).json({ status: 'error', message: 'Plan name and Arabic name are required' });
      }

      const created = await prisma.plan.create({
        data: {
          name,
          nameAr,
          description: description || '',
          priceSAR: Number(priceSAR || 0),
          priceEGP: Number(priceEGP || 0),
          priceUSD: Number(priceUSD || 0),
          instanceLimit: Number(instanceLimit || 1),
          messageLimit: Number(messageLimit || 1000),
          aiBotsLimit: Number(aiBotsLimit || 1),
          hasWebhooks: true,
          hasStoreIntegrations: true,
        },
      });

      return res.status(201).json({ status: 'success', message: 'New plan created', data: created });
    } catch (error: any) {
      return res.status(500).json({ status: 'error', message: error.message });
    }
  });

  // 12. Super Admin: List all virtual numbers
  router.get('/admin/numbers', async (req: Request, res: Response) => {
    try {
      const numbers = await prisma.virtualNumber.findMany({
        include: { tenant: true },
        orderBy: { createdAt: 'desc' },
      });
      return res.json({ status: 'success', data: numbers });
    } catch (error: any) {
      return res.status(500).json({ status: 'error', message: error.message });
    }
  });

  // 13. Super Admin: Add new virtual number to pool
  router.post('/admin/numbers/add', async (req: Request, res: Response) => {
    try {
      const { number, country, priceMonthly } = req.body;
      if (!number || !country) {
        return res.status(400).json({ status: 'error', message: 'Number and country are required' });
      }

      const created = await prisma.virtualNumber.create({
        data: {
          number,
          country,
          priceMonthly: Number(priceMonthly || 35),
          status: 'AVAILABLE',
        },
      });

      return res.status(201).json({ status: 'success', message: 'Virtual number added to inventory', data: created });
    } catch (error: any) {
      return res.status(500).json({ status: 'error', message: error.message });
    }
  });

  // 14. Super Admin: List invoices
  router.get('/admin/invoices', async (req: Request, res: Response) => {
    try {
      const invoices = await prisma.invoice.findMany({
        include: { tenant: true },
        orderBy: { createdAt: 'desc' },
      });
      return res.json({ status: 'success', data: invoices });
    } catch (error: any) {
      return res.status(500).json({ status: 'error', message: error.message });
    }
  });

  // 15. Tenant Message Templates
  router.get('/templates/:tenantId?', (req: Request, res: Response) => {
    try {
      const tenantId = req.params.tenantId || (req.query.tenantId as string) || 'default';
      const data = getTenantData(tenantId);
      return res.json({ status: 'success', data: data.templates || [] });
    } catch (error: any) {
      return res.status(500).json({ status: 'error', message: error.message });
    }
  });

  router.post('/templates/:tenantId?', (req: Request, res: Response) => {
    try {
      const tenantId = req.params.tenantId || req.body.tenantId || 'default';
      const { id, code, title, text, category } = req.body;
      if (!title || !text) {
        return res.status(400).json({ status: 'error', message: 'عنوان القالب ونص الرسالة مطلوبان' });
      }

      const tenantData = getTenantData(tenantId);
      tenantData.templates = tenantData.templates || [];

      if (id) {
        const idx = tenantData.templates.findIndex((t: any) => t.id === String(id) || t.code === code);
        if (idx !== -1) {
          tenantData.templates[idx] = { ...tenantData.templates[idx], code: code || tenantData.templates[idx].code, title, text, category };
        } else {
          tenantData.templates.push({ id: String(id), code: code || `tpl_${Date.now()}`, title, text, category });
        }
      } else {
        tenantData.templates.push({
          id: String(Date.now()),
          code: code || `tpl_${Date.now()}`,
          title,
          text,
          category: category || 'general',
        });
      }

      saveTenantData(tenantId, tenantData);
      return res.json({ status: 'success', message: 'تم حفظ القالب بنجاح', data: tenantData.templates });
    } catch (error: any) {
      return res.status(500).json({ status: 'error', message: error.message });
    }
  });

  router.delete('/templates/:tenantId/:id', (req: Request, res: Response) => {
    try {
      const { tenantId, id } = req.params;
      const tenantData = getTenantData(tenantId);
      tenantData.templates = (tenantData.templates || []).filter((t: any) => t.id !== String(id) && t.code !== String(id));
      saveTenantData(tenantId, tenantData);
      return res.json({ status: 'success', message: 'تم حذف القالب بنجاح', data: tenantData.templates });
    } catch (error: any) {
      return res.status(500).json({ status: 'error', message: error.message });
    }
  });

  // 16. Tenant Contacts
  router.get('/contacts/:tenantId?', (req: Request, res: Response) => {
    try {
      const tenantId = req.params.tenantId || (req.query.tenantId as string) || 'default';
      const data = getTenantData(tenantId);
      return res.json({ status: 'success', data: data.contacts || [] });
    } catch (error: any) {
      return res.status(500).json({ status: 'error', message: error.message });
    }
  });

  router.post('/contacts/:tenantId?', (req: Request, res: Response) => {
    try {
      const tenantId = req.params.tenantId || req.body.tenantId || 'default';
      const { id, name, phone, tag, country } = req.body;
      if (!name || !phone) {
        return res.status(400).json({ status: 'error', message: 'الاسم ورقم الهاتف مطلوبان' });
      }

      const tenantData = getTenantData(tenantId);
      tenantData.contacts = tenantData.contacts || [];

      if (id) {
        const idx = tenantData.contacts.findIndex((c: any) => c.id === String(id));
        if (idx !== -1) {
          tenantData.contacts[idx] = { ...tenantData.contacts[idx], name, phone, tag, country };
        } else {
          tenantData.contacts.push({ id: String(id), name, phone, tag: tag || 'VIP', country: country || 'SA', date: new Date().toISOString().slice(0, 10) });
        }
      } else {
        tenantData.contacts.push({
          id: String(Date.now()),
          name,
          phone,
          tag: tag || 'VIP',
          country: country || (phone.startsWith('+20') || phone.startsWith('20') ? 'EG' : 'SA'),
          date: new Date().toISOString().slice(0, 10),
        });
      }

      saveTenantData(tenantId, tenantData);
      return res.json({ status: 'success', message: 'تم حفظ جهة الاتصال بنجاح', data: tenantData.contacts });
    } catch (error: any) {
      return res.status(500).json({ status: 'error', message: error.message });
    }
  });

  router.post('/contacts/:tenantId/bulk', (req: Request, res: Response) => {
    try {
      const { tenantId } = req.params;
      const { contacts } = req.body;
      if (!Array.isArray(contacts)) {
        return res.status(400).json({ status: 'error', message: 'مصفوفة جهات الاتصال (contacts) مطلوبة' });
      }

      const tenantData = getTenantData(tenantId);
      tenantData.contacts = tenantData.contacts || [];

      contacts.forEach((c: any) => {
        if (c.name && c.phone) {
          tenantData.contacts.push({
            id: String(Date.now() + Math.random()),
            name: c.name,
            phone: c.phone,
            tag: c.tag || 'VIP',
            country: c.country || (String(c.phone).startsWith('20') ? 'EG' : 'SA'),
            date: new Date().toISOString().slice(0, 10),
          });
        }
      });

      saveTenantData(tenantId, tenantData);
      return res.json({ status: 'success', message: `تم استيراد ${contacts.length} جهة اتصال بنجاح!`, data: tenantData.contacts });
    } catch (error: any) {
      return res.status(500).json({ status: 'error', message: error.message });
    }
  });

  router.delete('/contacts/:tenantId/:id', (req: Request, res: Response) => {
    try {
      const { tenantId, id } = req.params;
      const tenantData = getTenantData(tenantId);
      tenantData.contacts = (tenantData.contacts || []).filter((c: any) => c.id !== String(id));
      saveTenantData(tenantId, tenantData);
      return res.json({ status: 'success', message: 'تم حذف جهة الاتصال بنجاح', data: tenantData.contacts });
    } catch (error: any) {
      return res.status(500).json({ status: 'error', message: error.message });
    }
  });

  // 17. Tenant Automation Rules
  router.get('/automation/rules/:tenantId?', (req: Request, res: Response) => {
    try {
      const tenantId = req.params.tenantId || (req.query.tenantId as string) || 'default';
      const data = getTenantData(tenantId);
      return res.json({ status: 'success', data: data.automationRules || [] });
    } catch (error: any) {
      return res.status(500).json({ status: 'error', message: error.message });
    }
  });

  router.post('/automation/rules/:tenantId?', (req: Request, res: Response) => {
    try {
      const tenantId = req.params.tenantId || req.body.tenantId || 'default';
      const { id, keyword, match, reply, active } = req.body;
      if (!keyword || !reply) {
        return res.status(400).json({ status: 'error', message: 'الكلمة المفتاحية والرد التلقائي مطلوبان' });
      }

      const tenantData = getTenantData(tenantId);
      tenantData.automationRules = tenantData.automationRules || [];

      if (id) {
        const idx = tenantData.automationRules.findIndex((r: any) => r.id === String(id));
        if (idx !== -1) {
          tenantData.automationRules[idx] = { ...tenantData.automationRules[idx], keyword, match, reply, active: active !== undefined ? active : true };
        } else {
          tenantData.automationRules.push({ id: String(id), keyword, match, reply, active: true });
        }
      } else {
        tenantData.automationRules.push({
          id: String(Date.now()),
          keyword,
          match: match || 'يحتوي',
          reply,
          active: active !== undefined ? Boolean(active) : true,
        });
      }

      saveTenantData(tenantId, tenantData);
      return res.json({ status: 'success', message: 'تم حفظ قاعدة الأتمتة بنجاح', data: tenantData.automationRules });
    } catch (error: any) {
      return res.status(500).json({ status: 'error', message: error.message });
    }
  });

  router.delete('/automation/rules/:tenantId/:id', (req: Request, res: Response) => {
    try {
      const { tenantId, id } = req.params;
      const tenantData = getTenantData(tenantId);
      tenantData.automationRules = (tenantData.automationRules || []).filter((r: any) => r.id !== String(id));
      saveTenantData(tenantId, tenantData);
      return res.json({ status: 'success', message: 'تم حذف قاعدة الأتمتة بنجاح', data: tenantData.automationRules });
    } catch (error: any) {
      return res.status(500).json({ status: 'error', message: error.message });
    }
  });

  // 18. E-Commerce Webhook Endpoint for Salla, Zid, Shopify, and WooCommerce
  router.post('/ecommerce/webhook/:tenantId/:platform', async (req: Request, res: Response) => {
    try {
      const { tenantId, platform } = req.params;
      const activeInstance = (req.query.instanceName as string) || (req.body.instanceName as string);

      const parsedEvent = eCommerceIntegrationService.parseWebhook(platform, req.body, tenantId);
      const result = await eCommerceIntegrationService.handleWebhook(parsedEvent, activeInstance);

      return res.status(200).json({
        status: 'success',
        message: 'تم استلام ومعالجة الويب هوك بنجاح',
        data: result,
      });
    } catch (error: any) {
      console.error('[ECommerce Webhook Error]:', error);
      return res.status(500).json({ status: 'error', message: error.message });
    }
  });

  router.get('/ecommerce/events', (req: Request, res: Response) => {
    try {
      const logs = eCommerceIntegrationService.getRecentLogs();
      return res.json({ status: 'success', data: logs });
    } catch (error: any) {
      return res.status(500).json({ status: 'error', message: error.message });
    }
  });

  return router;
}
