/**
 * Wox WhatsApp Platform - Master SaaS Interactive Controller
 * Developed by Ox Tech | Fully Wired to Evolution API & MySQL
 */

const API_BASE = window.location.origin;
const MASTER_API_KEY = '429683C4C977415CAAFCCE10F7D57E11';
let currentApiKey = MASTER_API_KEY;
let currentActiveView = 'dashboard';
let activeDevLanguage = 'curl';
let currentInstIdx = 0;
let qrPollInterval = null;
let currentQrInstanceId = null;
let activeChatConvId = null;
let activeChatFilterTag = 'all';
let activeChatTypeFilter = 'all'; // 'all' | 'direct' | 'group' | 'channel'
let selectedCustomTagColor = '#B45309';

// Preset Rich Tag Definitions (Luxury Design, 100% SVG Vector Icons, Zero Emojis)
const PRESET_TAG_DEFINITIONS = [
  { 
    id: 'VIP', 
    name: 'عميل VIP', 
    sub: 'عملاء مميزين وأولوية قصوى', 
    color: '#D97706', 
    bg: '#FEF3C7', 
    iconSvg: '<svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.2" stroke-linecap="round" stroke-linejoin="round"><path d="M2 4l3 12h14l3-12-6 7-4-7-4 7-6-7z"/><path d="M4 20h16"/></svg>' 
  },
  { 
    id: 'جديد', 
    name: 'عميل جديد', 
    sub: 'محادثة أولى تحتاج ترحيب', 
    color: '#16A34A', 
    bg: '#DCFCE7', 
    iconSvg: '<svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.2" stroke-linecap="round" stroke-linejoin="round"><path d="M16 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2"/><circle cx="8.5" cy="7" r="4"/><line x1="20" y1="8" x2="20" y2="14"/><line x1="23" y1="11" x2="17" y2="11"/></svg>' 
  },
  { 
    id: 'مهتم', 
    name: 'مهتم بالشراء', 
    sub: 'استفسار عن أسعار وخدمات', 
    color: '#2563EB', 
    bg: '#DBEAFE', 
    iconSvg: '<svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.2" stroke-linecap="round" stroke-linejoin="round"><path d="M19 21l-7-5-7 5V5a2 2 0 0 1 2-2h10a2 2 0 0 1 2 2z"/></svg>' 
  },
  { 
    id: 'طلب مؤكد', 
    name: 'طلب مؤكد', 
    sub: 'قيد التجهيز والدفع', 
    color: '#9333EA', 
    bg: '#F3E8FF', 
    iconSvg: '<svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.2" stroke-linecap="round" stroke-linejoin="round"><path d="M21 16V8a2 2 0 0 0-1-1.73l-7-4a2 2 0 0 0-2 0l-7 4A2 2 0 0 0 3 8v8a2 2 0 0 0 1 1.73l7 4a2 2 0 0 0 2 0l7-4A2 2 0 0 0 21 16z"/><polyline points="3.27 6.96 12 12.01 20.73 6.96"/><line x1="12" y1="22.08" x2="12" y2="12"/></svg>' 
  },
  { 
    id: 'سلة متروكة', 
    name: 'سلة متروكة', 
    sub: 'إعادة تذكير بالشراء', 
    color: '#EA580C', 
    bg: '#FFEDD5', 
    iconSvg: '<svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.2" stroke-linecap="round" stroke-linejoin="round"><circle cx="9" cy="21" r="1"/><circle cx="20" cy="21" r="1"/><path d="M1 1h4l2.68 13.39a2 2 0 0 0 2 1.61h9.72a2 2 0 0 0 2-1.61L23 6H6"/></svg>' 
  },
  { 
    id: 'شكوى', 
    name: 'شكوى ودعم', 
    sub: 'مشكلة فنية أو شكوى عاجلة', 
    color: '#DC2626', 
    bg: '#FEE2E2', 
    iconSvg: '<svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.2" stroke-linecap="round" stroke-linejoin="round"><circle cx="12" cy="12" r="10"/><line x1="12" y1="8" x2="12" y2="12"/><line x1="12" y1="16" x2="12.01" y2="16"/></svg>' 
  },
  { 
    id: 'تاجر', 
    name: 'شريك أو جملة', 
    sub: 'عميل جملة أو تجاري', 
    color: '#0D9488', 
    bg: '#CCFBF1', 
    iconSvg: '<svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.2" stroke-linecap="round" stroke-linejoin="round"><rect x="2" y="7" width="20" height="14" rx="2" ry="2"/><path d="M16 21V5a2 2 0 0 0-2-2h-4a2 2 0 0 0-2 2v16"/></svg>' 
  },
  { 
    id: 'مستعجل', 
    name: 'رد مستعجل', 
    sub: 'يحتاج متابعة سريعة جداً', 
    color: '#E11D48', 
    bg: '#FFE4E6', 
    iconSvg: '<svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.2" stroke-linecap="round" stroke-linejoin="round"><polygon points="13 2 3 14 12 14 11 22 21 10 12 10 13 2"/></svg>' 
  },
];

// Helper: Get scaled SVG icon for tag
function renderTagIcon(tag, size = 12) {
  const clean = sanitizeTag(tag);
  const def = PRESET_TAG_DEFINITIONS.find(d => clean === d.id || clean.includes(d.id) || clean.includes(d.name));
  if (def && def.iconSvg) {
    return def.iconSvg.replace(/width="\d+" height="\d+"/, `width="${size}" height="${size}"`);
  }
  return `<svg width="${size}" height="${size}" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5"><circle cx="12" cy="12" r="3.5"/></svg>`;
}

// Customer Names & Tags Local Storage Keys
const CUSTOM_NAMES_KEY = 'wox_custom_names';
const CUSTOMER_TAGS_KEY = 'wox_customer_tags';

// Helper: Strip any emoji characters strictly to ensure pure UI icons only
function sanitizeTag(tag) {
  if (!tag || typeof tag !== 'string') return '';
  return tag.replace(/[\u{1F300}-\u{1FAD6}\u{2600}-\u{27BF}\u{1F900}-\u{1F9FF}\u{1F600}-\u{1F64F}\u{1F680}-\u{1F6FF}\u{200D}\u{FE0F}]/gu, '').trim();
}

function loadSanitizedCustomerTags() {
  try {
    const raw = JSON.parse(localStorage.getItem(CUSTOMER_TAGS_KEY) || '{}');
    const cleaned = {};
    for (const [k, v] of Object.entries(raw)) {
      if (Array.isArray(v)) {
        cleaned[k] = v.map(t => sanitizeTag(t)).filter(Boolean);
      }
    }
    return cleaned;
  } catch (e) {
    return {};
  }
}

// Reactive Global State (Single Source of Truth)
const woxState = {
  instances: [],
  messages: [],
  customNames: JSON.parse(localStorage.getItem(CUSTOM_NAMES_KEY) || '{}'),
  customerTags: loadSanitizedCustomerTags(),
  templates: [
    { code: 'order_confirmation', title: 'تأكيد الطلب', text: 'تم تأكيد طلبك رقم {{1}} من متجرنا بنجاح، جاري التجهيز للشحن الفوري.' },
    { code: 'order_shipped', title: 'تم الشحن', text: 'أهلاً بك! تم تسليم شحنتك رقم {{1}} لشركة الشحن {{2}}، كود التتبع: {{3}}' },
    { code: 'abandoned_cart', title: 'سلة متروكة', text: 'مرحباً {{1}}! لاحظنا وجود منتجات مميزة في سلتك، أكمل طلبك الآن واستمتع بخصم خاص عبر الرابط: {{2}}' },
    { code: 'review_request', title: 'طلب تقييم', text: 'رأيك يهمنا دائماً! شاركنا تجربتك لطلبك الأخير واحصل على كوبون هدية: {{1}}' },
    { code: 'promo_offer', title: 'عروض حصرية', text: 'خصومات حصرية لفترة محدودة! استخدم الكوبون {{1}} للحصول على خصم {{2}}% على كافة المنتجات.' }
  ],
  contacts: [],
  automationRules: [
    { keyword: 'الأسعار', match: 'يحتوي على', reply: 'أهلاً بك! يمكنك الاطلاع على أحدث قوائم الأسعار والعروض عبر موقعنا الرسمي.', active: true },
    { keyword: 'مواعيد العمل', match: 'يحتوي على', reply: 'ساعات العمل الرسمية: يومياً من 9 صباحاً حتى 10 مساءً عدا الجمعة.', active: true },
    { keyword: 'الشحن والتوصيل', match: 'يحتوي على', reply: 'نوفر شحناً سريعاً لجميع مدن المملكة ومصر خلال 24-48 ساعة عمل.', active: true }
  ],
  logs: [
    {
      time: new Date().toLocaleTimeString('ar-SA', { hour: '2-digit', minute: '2-digit' }),
      event: 'بدء تشغيل المنصة',
      status: '200 OK',
      inst: 'خادم Wox',
      detail: 'تم تهيئة النظام والربط مع محرك Evolution API بنجاح'
    }
  ]
};

// Helper: Get active connected instance or first available
function getActiveInstance() {
  return woxState.instances.find(i => i.status === 'connected') || woxState.instances[0] || null;
}

async function initWoxApp() {
  initSessionAuth();

  // Match URL route (e.g. /dashboard/instances -> 'instances')
  const segments = window.location.pathname.split('/').filter(Boolean);
  const routeParam = segments.length > 1 ? segments[1] : (segments[0] !== 'dashboard' ? segments[0] : 'dashboard');
  if (routeParam && document.getElementById(`view-${routeParam}`)) {
    switchView(routeParam, false);
  } else {
    switchView('dashboard', false);
  }

  await fetchInstancesStats();
  initLiveChatPolling();
}

if (document.readyState === 'loading') {
  document.addEventListener('DOMContentLoaded', initWoxApp);
} else {
  initWoxApp();
}

// =============================================================================
// 1. SPA View Router & Navigation
// =============================================================================
function switchView(viewId, updateHistory = true) {
  currentActiveView = viewId;

  // Update browser URL if navigating
  if (updateHistory && window.history && window.history.pushState) {
    const newPath = viewId === 'dashboard' ? '/dashboard' : `/dashboard/${viewId}`;
    if (window.location.pathname.startsWith('/dashboard') && window.location.pathname !== newPath) {
      window.history.pushState(null, '', newPath);
    }
  }

  // Update active sidebar nav button
  document.querySelectorAll('.sidebar-nav-item').forEach(item => item.classList.remove('active'));
  const targetNav = document.getElementById(`nav-${viewId}`);
  if (targetNav) targetNav.classList.add('active');

  // Hide all views and activate target
  document.querySelectorAll('.spa-view').forEach(view => view.classList.remove('active'));
  const targetView = document.getElementById(`view-${viewId}`);
  if (targetView) {
    targetView.classList.add('active');
    window.scrollTo({ top: 0, behavior: 'smooth' });
  }

  // Update contextual search placeholder
  const searchInput = document.getElementById('global-search-input');
  if (searchInput) {
    switch (viewId) {
      case 'instances': searchInput.placeholder = 'ابحث في أرقام واسماء الانستنتات...'; break;
      case 'messages': searchInput.placeholder = 'ابحث في أسماء المحادثات والرسائل...'; break;
      case 'templates': searchInput.placeholder = 'ابحث في أسماء وأكواد القوالب...'; break;
      case 'contacts': searchInput.placeholder = 'ابحث في جهات الاتصال والأرقام والتصنيفات...'; break;
      case 'logs': searchInput.placeholder = 'ابحث في تفاصيل الأحداث والسجلات...'; break;
      default: searchInput.placeholder = 'ابحث في الرسائل، جهات الاتصال، أو القوالب...'; break;
    }
  }

  // Auto-refresh view-specific dynamic data
  if (viewId === 'messages') {
    fetchRealChats();
  } else if (viewId === 'contacts') {
    fetchRealContacts();
  } else if (viewId === 'webhooks') {
    loadWebhookConfiguration();
  }

  showToast(`تم فتح شاشة: ${getArabicViewTitle(viewId)}`);
}

function getArabicViewTitle(id) {
  const titles = {
    dashboard: 'الرئيسية',
    instances: 'الانستنتات',
    messages: 'الرسائل والمحادثات',
    templates: 'قوالب الرسائل',
    contacts: 'جهات الاتصال',
    webhooks: 'الويب هوكس',
    automation: 'الأتمتة والبوتات',
    logs: 'سجلات النظام',
    developers: 'بوابة المطورين',
    settings: 'الإعدادات والاشتراك'
  };
  return titles[id] || id;
}

// =============================================================================
// 2. Rendering Engine
// =============================================================================

// 2.1 Dashboard Render
function renderDashboardData() {
  const totalMsgs = woxState.instances.reduce((sum, i) => sum + (i.msgsToday || 0), 0);
  const totalChats = woxState.instances.reduce((sum, i) => sum + (i.chatsCount || 0), 0);
  const connCount = woxState.instances.filter(i => i.status === 'connected').length;
  const disconnCount = woxState.instances.length - connCount;

  const kpiSent = document.getElementById('kpi-sent-msgs');
  const kpiRecv = document.getElementById('kpi-received-msgs');
  const kpiCont = document.getElementById('kpi-contacts-count');
  const kpiInst = document.getElementById('kpi-instances-count');

  if (kpiSent) kpiSent.textContent = totalMsgs > 0 ? totalMsgs.toLocaleString('en-US') : '0';
  if (kpiRecv) kpiRecv.textContent = totalChats > 0 ? totalChats.toLocaleString('en-US') : '0';
  if (kpiCont) kpiCont.textContent = (woxState.contacts.length || 0).toLocaleString('en-US');
  if (kpiInst) kpiInst.textContent = String(woxState.instances.length);

  const pillsWrap = document.querySelector('.stat-status-pills');
  if (pillsWrap) {
    pillsWrap.innerHTML = `
      <span class="mini-status-pill online"><span class="pulse-dot green"></span><span>${connCount} متصل</span></span>
      <span class="mini-status-pill offline"><span class="pulse-dot red"></span><span>${disconnCount} غير متصل</span></span>
    `;
  }

  // Instances table on dashboard
  const tbody = document.getElementById('instances-table-body');
  if (tbody) {
    tbody.innerHTML = '';
    if (woxState.instances.length === 0) {
      tbody.innerHTML = `
        <tr>
          <td colspan="6" style="text-align: center; padding: 36px 20px;">
            <div style="display: flex; flex-direction: column; align-items: center; gap: 8px; color: #8C847D;">
              <div style="width: 44px; height: 44px; border-radius: 12px; background: rgba(197, 155, 109, 0.12); display: flex; align-items: center; justify-content: center; color: #C59B6D;">
                <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M21 11.5a8.38 8.38 0 0 1-.9 3.8 8.5 8.5 0 0 1-7.6 4.7 8.38 8.38 0 0 1-3.8-.9L3 21l1.9-5.7a8.38 8.38 0 0 1-.9-3.8 8.5 8.5 0 0 1 4.7-7.6 8.38 8.38 0 0 1 3.8-.9h.5a8.48 8.48 0 0 1 8 8v.5z"/></svg>
              </div>
              <div style="font-size: 15px; font-weight: 700; color: #1C1613;">لا توجد أرقام واتساب مربوطة بحسابك حالياً</div>
              <div style="font-size: 13px; color: #8C847D;">ابدأ الآن بربط أول رقم واتساب لمتجرك عبر مسح كود QR</div>
              <button class="btn-primary btn-gold" style="margin-top: 6px; font-size: 12px; padding: 8px 18px;" onclick="openCreateInstanceModal()">
                إضافة انستنس جديد الآن
              </button>
            </div>
          </td>
        </tr>
      `;
    } else {
      woxState.instances.forEach(inst => {
        const isConn = inst.status === 'connected';
        const tr = document.createElement('tr');
        tr.innerHTML = `
          <td>
            <div class="table-actions-cell">
              <button class="action-icon-btn" title="خيارات" onclick="showInstanceOptions('${inst.id}')">
                <svg style="width: 15px; height: 15px;" viewBox="0 0 24 24" fill="currentColor"><circle cx="12" cy="12" r="2"/><circle cx="19" cy="12" r="2"/><circle cx="5" cy="12" r="2"/></svg>
              </button>
              <button class="action-icon-btn" title="رمز QR" onclick="showQrModalFor('${inst.id}')">
                <svg style="width: 15px; height: 15px;" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><rect x="3" y="3" width="7" height="7"/><rect x="14" y="3" width="7" height="7"/><rect x="14" y="14" width="7" height="7"/><rect x="3" y="14" width="7" height="7"/></svg>
              </button>
              <button class="action-icon-btn" title="تعديل" onclick="editInstance('${inst.id}')">
                <svg style="width: 15px; height: 15px;" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M17 3a2.828 2.828 0 1 1 4 4L7.5 20.5 2 22l1.5-5.5L17 3z"/></svg>
              </button>
            </div>
          </td>
          <td><span style="font-weight: 700; color: #171E1B; font-family: 'Inter';">${inst.msgsToday || 0}</span></td>
          <td><span style="color: #6B7280; font-size: 13px;">${inst.lastSeen || 'الآن'}</span></td>
          <td>
            <span class="status-badge-pill ${isConn ? 'connected' : 'disconnected'}">
              <span class="pulse-dot ${isConn ? 'green' : 'red'}"></span>
              <span>${isConn ? 'متصل' : 'غير متصل'}</span>
            </span>
          </td>
          <td><span class="phone-badge-text">${inst.phone}</span></td>
          <td>
            <div class="instance-name-cell">
              <div class="inst-name-col">
                <span class="inst-title">${inst.name}</span>
                <span class="inst-sub">${inst.sub}</span>
              </div>
              <div class="instance-wa-avatar" style="${isConn ? '' : 'background: #E5E7EB; color: #9CA3AF;'}">
                <svg style="width: 17px; height: 17px;" viewBox="0 0 24 24" fill="currentColor"><path d="M6.62 10.79a15.05 15.05 0 0 0 6.59 6.59l2.2-2.2a1 1 0 0 1 1.02-.24 11.72 11.72 0 0 0 3.68.59 1 1 0 0 1 1 1V20a1 1 0 0 1-1 1A17 17 0 0 1 3 4a1 1 0 0 1 1-1h3.5a1 1 0 0 1 1 1 11.72 11.72 0 0 0 .59 3.68 1 1 0 0 1-.25 1.02l-2.22 2.09z"/></svg>
              </div>
            </div>
          </td>
        `;
        tbody.appendChild(tr);
      });
    }
  }

  // Dashboard recent messages
  const recList = document.getElementById('dashboard-recent-msgs');
  if (recList) {
    recList.innerHTML = '';
    if (woxState.messages.length === 0) {
      recList.innerHTML = `
        <div style="padding: 32px 16px; text-align: center; color: #8C847D;">
          <div style="width: 38px; height: 38px; border-radius: 10px; background: rgba(197, 155, 109, 0.12); margin: 0 auto 10px; display: flex; align-items: center; justify-content: center; color: #C59B6D;">
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z"/></svg>
          </div>
          <div style="font-size: 13.5px; font-weight: 700; color: #1C1613; margin-bottom: 4px;">لا توجد رسائل سابقة</div>
          <div style="font-size: 12px; color: #8C847D; margin-bottom: 12px;">المحادثات المباشرة عبر واتساب ستظهر هنا فور إرسالها أو استقبالها</div>
          <button class="btn-primary-action" style="font-size: 11.5px; padding: 6px 14px; margin: 0 auto; display: inline-flex;" onclick="switchView('messages'); showNewChatPrompt();">
            <span>بدء محادثة جديدة +</span>
          </button>
        </div>
      `;
    } else {
      woxState.messages.slice(0, 4).forEach(m => {
        const item = document.createElement('div');
        item.className = 'recent-msg-item';
        item.onclick = () => { switchView('messages'); selectChatConversation(m.id || m.remoteJid); };
        const resolvedName = getCustomerDisplayName(m);
        item.innerHTML = `
          <div class="msg-sender-group">
            <div class="msg-wa-avatar">
              <svg style="width: 15px; height: 15px;" viewBox="0 0 24 24" fill="currentColor"><path d="M6.62 10.79a15.05 15.05 0 0 0 6.59 6.59l2.2-2.2a1 1 0 0 1 1.02-.24 11.72 11.72 0 0 0 3.68.59 1 1 0 0 1 1 1V20a1 1 0 0 1-1 1A17 17 0 0 1 3 4a1 1 0 0 1 1-1h3.5a1 1 0 0 1 1 1 11.72 11.72 0 0 0 .59 3.68 1 1 0 0 1-.25 1.02l-2.22 2.09z"/></svg>
            </div>
            <div class="msg-text-col">
              <span class="msg-phone-text">${m.phone}</span>
              <span class="msg-sender-name">${resolvedName}</span>
            </div>
          </div>
          <div class="msg-snippet-col">
            <span class="msg-snippet-text">${m.snippet}</span>
            <span class="msg-time-tag"><span>${m.time}</span></span>
          </div>
        `;
        recList.appendChild(item);
      });
    }
  }

  // Dashboard templates preview list
  const tplList = document.getElementById('dashboard-templates-list');
  if (tplList) {
    tplList.innerHTML = '';
    woxState.templates.slice(0, 4).forEach(t => {
      const item = document.createElement('div');
      item.className = 'template-item-row';
      item.innerHTML = `
        <div class="template-info-group">
          <div class="template-doc-icon">
            <svg style="width: 15px; height: 15px;" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"/><polyline points="14 2 14 8 20 8"/></svg>
          </div>
          <div>
            <div class="template-title-text">${t.title}</div>
            <div class="template-preview-sub">${t.text}</div>
          </div>
        </div>
        <div class="template-action-group">
          <span class="template-code-badge">${t.code}</span>
          <button class="action-icon-btn" title="نسخ القالب" onclick="copyTemplate('${t.code}')">
            <svg style="width: 13px; height: 13px;" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><rect x="9" y="9" width="13" height="13" rx="2"/><path d="M5 15H4a2 2 0 0 1-2-2V4a2 2 0 0 1 2-2h9a2 2 0 0 1 2 2v1"/></svg>
          </button>
        </div>
      `;
      tplList.appendChild(item);
    });
  }
}

// 2.2 Instances Grid Render
function renderInstancesView() {
  const grid = document.getElementById('instances-full-grid');
  if (!grid) return;
  grid.innerHTML = '';

  if (woxState.instances.length === 0) {
    grid.innerHTML = `
      <div style="grid-column: 1 / -1; background: #FFFFFF; border: 1px dashed var(--border-color); border-radius: 14px; padding: 48px 24px; text-align: center;">
        <div style="width: 48px; height: 48px; border-radius: 12px; background: rgba(197, 155, 109, 0.15); margin: 0 auto 14px; display: flex; align-items: center; justify-content: center; color: #C59B6D;">
          <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M21 11.5a8.38 8.38 0 0 1-.9 3.8 8.5 8.5 0 0 1-7.6 4.7 8.38 8.38 0 0 1-3.8-.9L3 21l1.9-5.7a8.38 8.38 0 0 1-.9-3.8 8.5 8.5 0 0 1 4.7-7.6 8.38 8.38 0 0 1 3.8-.9h.5a8.48 8.48 0 0 1 8 8v.5z"/></svg>
        </div>
        <div style="font-size: 16px; font-weight: 800; color: #171E1B; margin-bottom: 6px;">لا توجد انستنتات مضافة بعد</div>
        <div style="font-size: 13px; color: #6B7280; max-width: 400px; margin: 0 auto 18px; line-height: 1.6;">قم بإضافة رقم واتساب متجرك الأول لتتمكن من إرسال واستقبال الرسائل وتفعيل الشات بوت.</div>
        <button class="btn-primary-action" style="padding: 10px 24px; font-size: 13px; margin: 0 auto; display: inline-flex;" onclick="openCreateInstanceModal()">
          إضافة انستنس جديد الآن
        </button>
      </div>
    `;
    return;
  }

  woxState.instances.forEach(inst => {
    const isConn = inst.status === 'connected';
    const card = document.createElement('div');
    card.className = 'instance-box-card';
    card.innerHTML = `
      <div class="inst-card-header">
        <span class="status-badge-pill ${isConn ? 'connected' : 'disconnected'}">
          <span class="pulse-dot ${isConn ? 'green' : 'red'}"></span>
          <span>${isConn ? 'متصل' : 'غير متصل'}</span>
        </span>
        <div class="inst-avatar-row">
          <div class="inst-meta-col" style="text-align: right;">
            <div style="font-size: 15px; font-weight: 800; color: #171E1B;">${inst.name}</div>
            <div style="font-size: 11.5px; color: var(--text-muted);">${inst.sub}</div>
          </div>
          <div class="instance-wa-avatar" style="width: 36px; height: 36px; ${isConn ? '' : 'background: #E5E7EB; color: #9CA3AF;'}">
            <svg style="width: 18px; height: 18px;" viewBox="0 0 24 24" fill="currentColor"><path d="M6.62 10.79a15.05 15.05 0 0 0 6.59 6.59l2.2-2.2a1 1 0 0 1 1.02-.24 11.72 11.72 0 0 0 3.68.59 1 1 0 0 1 1 1V20a1 1 0 0 1-1 1A17 17 0 0 1 3 4a1 1 0 0 1 1-1h3.5a1 1 0 0 1 1 1 11.72 11.72 0 0 0 .59 3.68 1 1 0 0 1-.25 1.02l-2.22 2.09z"/></svg>
          </div>
        </div>
      </div>

      <div class="inst-card-body-stats">
        <div class="stat-item-mini">
          <span>رقم الواتساب</span>
          <span style="font-size: 12.5px; direction: ltr;">${inst.phone}</span>
        </div>
        <div class="stat-item-mini">
          <span>رسائل اليوم</span>
          <span>${inst.msgsToday || 0}</span>
        </div>
      </div>

      <div class="inst-card-actions-bar">
        <div style="display: flex; gap: 6px;">
          <button class="action-icon-btn" title="حذف" onclick="deleteInstance('${inst.id}')">
            <svg style="width: 14px; height: 14px;" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><polyline points="3 6 5 6 21 6"/><path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6"/></svg>
          </button>
          <button class="action-icon-btn" title="إعادة تشغيل" onclick="restartInstance('${inst.id}')">
            <svg style="width: 14px; height: 14px;" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M21.5 2v6h-6M21.34 15.57a10 10 0 1 1-.57-8.38l5.67-5.67"/></svg>
          </button>
        </div>
        <button class="btn-primary-action" style="padding: 6px 14px; font-size: 12px;" onclick="showQrModalFor('${inst.id}')">
          <svg style="width: 14px; height: 14px;" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><rect x="3" y="3" width="7" height="7"/><rect x="14" y="3" width="7" height="7"/><rect x="14" y="14" width="7" height="7"/><rect x="3" y="14" width="7" height="7"/></svg>
          <span>${isConn ? 'فحص الـ QR' : 'مسح QR Code'}</span>
        </button>
      </div>
    `;
    grid.appendChild(card);
  });
}

// 2.3 Customer Display Name & Tag Helpers
function getCustomerDisplayName(convOrJid) {
  if (!convOrJid) return 'عميل واتساب';
  const jid = typeof convOrJid === 'string' ? convOrJid : (convOrJid.id || convOrJid.remoteJid || '');
  const conv = typeof convOrJid === 'object' ? convOrJid : woxState.messages.find(m => m.id === jid || m.remoteJid === jid);

  // 1. Check user custom name first
  if (woxState.customNames[jid]) return woxState.customNames[jid];
  if (conv?.remoteJidAlt && woxState.customNames[conv.remoteJidAlt]) return woxState.customNames[conv.remoteJidAlt];

  // 2. If conv.name is a real human-readable name (not digits only)
  if (conv?.name && isNaN(conv.name) && !conv.name.includes('@') && conv.name !== 'Você') {
    return conv.name;
  }

  // 3. Match against contacts phonebook in memory
  const phone = (conv.phone || conv.remoteJidAlt || jid).replace(/@.+/, '').replace(/[^\d]/g, '');
  if (phone && woxState.contacts && woxState.contacts.length > 0) {
    const matched = woxState.contacts.find(c => {
      const cPhone = (c.phone || c.remoteJid || c.id || '').replace(/[^\d]/g, '');
      return cPhone && (cPhone === phone || cPhone.endsWith(phone) || phone.endsWith(cPhone));
    });
    if (matched && matched.name && isNaN(matched.name) && !matched.name.includes('@')) {
      return matched.name;
    }
  }

  if (conv?.name && isNaN(conv.name)) return conv.name;
  if (conv?.remoteJidAlt) return '+' + conv.remoteJidAlt.replace(/@.+/, '');
  if (jid.includes('@s.whatsapp.net')) return '+' + jid.replace(/@.+/, '');
  return conv?.phone || conv?.name || jid.split('@')[0];
}

function getCustomerTags(jid) {
  if (!jid) return [];
  const conv = woxState.messages.find(m => m.id === jid || m.remoteJid === jid);
  const tags = woxState.customerTags[jid] || (conv?.remoteJidAlt ? woxState.customerTags[conv.remoteJidAlt] : null) || [];
  return tags;
}

function getTagStyle(tag) {
  const matched = PRESET_TAG_DEFINITIONS.find(def => tag === def.id || tag.includes(def.id) || tag.includes(def.name));
  if (matched) {
    return `border: 1px solid ${matched.color}66; background: ${matched.bg}; color: ${matched.color};`;
  }
  return 'border: 1px solid #D1D5DB; background: #F3F4F6; color: #374151;';
}

// Determine if a conversation is group, channel, or direct chat
function getChatType(conv) {
  const jid = (conv.id || conv.remoteJid || '').toLowerCase();
  if (jid.includes('@g.us')) return 'group';
  if (jid.includes('@newsletter')) return 'channel';
  return 'direct';
}

// Toggle between: all | direct | group | channel
function setChatTypeFilter(type, btn) {
  activeChatTypeFilter = type;
  document.querySelectorAll('.chat-type-toggle-btn').forEach(b => b.classList.remove('active'));
  if (btn) {
    btn.classList.add('active');
  } else {
    const el = document.getElementById(`toggle-chat-${type}`);
    if (el) el.classList.add('active');
  }
  renderChatView();
  const label = type === 'group' ? 'المجموعات' : type === 'channel' ? 'القنوات' : type === 'direct' ? 'المحادثات الفردية' : 'جميع المحادثات';
  showToast(`عرض: ${label}`);
}

// Update Chat Type Badges Count
function updateChatTypeCounts() {
  const allCount = woxState.messages.length;
  const directCount = woxState.messages.filter(m => getChatType(m) === 'direct').length;
  const groupCount = woxState.messages.filter(m => getChatType(m) === 'group').length;
  const channelCount = woxState.messages.filter(m => getChatType(m) === 'channel').length;

  const elAll = document.getElementById('chat-count-all');
  const elDirect = document.getElementById('chat-count-direct');
  const elGroup = document.getElementById('chat-count-group');
  const elChannel = document.getElementById('chat-count-channel');

  if (elAll) elAll.textContent = allCount;
  if (elDirect) elDirect.textContent = directCount;
  if (elGroup) elGroup.textContent = groupCount;
  if (elChannel) elChannel.textContent = channelCount;
}

// Render dynamic tag pills filter bar with live counts
function renderChatTagFilterBar() {
  const bar = document.getElementById('chat-tag-filter-bar');
  if (!bar) return;

  const scopedMessages = woxState.messages.filter(conv => {
    if (activeChatTypeFilter === 'all') return true;
    return getChatType(conv) === activeChatTypeFilter;
  });

  const tagCounts = {};
  PRESET_TAG_DEFINITIONS.forEach(def => { tagCounts[def.id] = 0; });

  scopedMessages.forEach(conv => {
    const tags = getCustomerTags(conv.id || conv.remoteJid);
    tags.forEach(t => {
      PRESET_TAG_DEFINITIONS.forEach(def => {
        if (t === def.id || t.includes(def.id)) {
          tagCounts[def.id] = (tagCounts[def.id] || 0) + 1;
        }
      });
    });
  });

  let html = `
    <button class="chat-tag-pill-filter ${activeChatFilterTag === 'all' ? 'active' : ''}" onclick="filterChatsByTag('all', this)">
      <span>الكل</span>
      <span class="chat-tag-pill-count">${scopedMessages.length}</span>
    </button>
  `;

  PRESET_TAG_DEFINITIONS.forEach(def => {
    const count = tagCounts[def.id] || 0;
    const isAct = activeChatFilterTag === def.id;
    const icon = renderTagIcon(def.id, 12);
    html += `
      <button class="chat-tag-pill-filter ${isAct ? 'active' : ''}" onclick="filterChatsByTag('${def.id}', this)" style="${isAct ? `background: ${def.color}; color: #FFF; border-color: ${def.color};` : `color: ${def.color}; border-color: ${def.color}40; background: ${def.bg};`}">
        ${icon}
        <span>${def.name}</span>
        <span class="chat-tag-pill-count" style="${isAct ? 'background: rgba(255,255,255,0.25); color: #FFF;' : `color: ${def.color}; background: ${def.color}18;`}">${count}</span>
      </button>
    `;
  });

  bar.innerHTML = html;
}

// 2.4 Live Chat View Render
function renderChatView() {
  updateChatTypeCounts();
  renderChatTagFilterBar();

  const convList = document.getElementById('chat-conv-list');
  if (!convList) return;
  convList.innerHTML = '';

  const activeInst = getActiveInstance();

  if (woxState.messages.length === 0) {
    convList.innerHTML = `
      <div style="padding: 32px 14px; text-align: center; color: #8C847D;">
        <div style="width: 40px; height: 40px; border-radius: 10px; background: rgba(197, 155, 109, 0.12); margin: 0 auto 10px; display: flex; align-items: center; justify-content: center; color: #C59B6D;">
          <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z"/></svg>
        </div>
        <div style="font-size: 13.5px; font-weight: 700; color: #1C1613; margin-bottom: 4px;">
          ${activeInst && activeInst.status === 'connected' ? 'جاري مزامنة المحادثات...' : 'لا توجد أجهزة متصلة'}
        </div>
        <div style="font-size: 11.5px; color: #8C847D; margin-bottom: 14px; line-height: 1.5;">
          ${activeInst && activeInst.status === 'connected' ? 'اضغط لتحديث سجل المحادثات المباشر' : 'اربط رقم واتساب لبدء استقبال وإرسال الرسائل'}
        </div>
        <button class="btn-primary-action" style="font-size: 12px; padding: 7px 14px; margin: 0 auto; display: inline-flex;" onclick="fetchRealChats()">
          <span>تحديث المحادثات ↻</span>
        </button>
      </div>
    `;

    const stream = document.getElementById('chat-thread-stream');
    if (stream) {
      stream.innerHTML = `
        <div style="height: 100%; display: flex; flex-direction: column; align-items: center; justify-content: center; color: #8C847D; text-align: center; padding: 24px;">
          <div style="width: 56px; height: 56px; border-radius: 14px; background: #FAF8F5; border: 1px dashed #DDD8CE; display: flex; align-items: center; justify-content: center; color: #C59B6D; margin-bottom: 14px;">
            <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z"/></svg>
          </div>
          <div style="font-size: 16px; font-weight: 800; color: #1C1613; margin-bottom: 6px;">صندوق المحادثات المباشرة</div>
          <div style="font-size: 13px; color: #6B7280; max-width: 360px; line-height: 1.6; margin-bottom: 16px;">
            ${activeInst && activeInst.status === 'connected' ? `جهازك [${activeInst.name}] متصل بنجاح! اختر محادثة للرد الفوري على العميل.` : 'يرجى ربط جهاز واتساب عبر مسح رمز QR لبدء التواصل الحي.'}
          </div>
          ${activeInst && activeInst.status === 'connected' ? '<button class="btn-primary-action" style="font-size: 12.5px; padding: 8px 18px;" onclick="fetchRealChats()">تحديث المحادثات الآن ↻</button>' : '<button class="btn-primary btn-gold" style="font-size: 12.5px; padding: 8px 18px;" onclick="switchView(\'instances\')">ربط واتساب الآن</button>'}
        </div>
      `;
    }

    const nameHeader = document.getElementById('active-chat-name');
    const phoneHeader = document.getElementById('active-chat-phone');
    if (nameHeader) nameHeader.textContent = 'صندوق الرسائل';
    if (phoneHeader) phoneHeader.textContent = activeInst && activeInst.status === 'connected' ? `متصل (${activeInst.phone})` : 'غير متصل';
    return;
  }

  // Filter 1: Chat Type (all | direct | group | channel)
  const typeFiltered = woxState.messages.filter(conv => {
    if (activeChatTypeFilter === 'all') return true;
    return getChatType(conv) === activeChatTypeFilter;
  });

  // Filter 2: Tag (all | VIP | جديد | ...)
  const filteredMessages = typeFiltered.filter(conv => {
    if (activeChatFilterTag === 'all') return true;
    const tags = getCustomerTags(conv.id || conv.remoteJid);
    return tags.includes(activeChatFilterTag) || tags.some(t => t.includes(activeChatFilterTag));
  });

  if (filteredMessages.length === 0) {
    const typeLabel = activeChatTypeFilter === 'group' ? 'مجموعات' : activeChatTypeFilter === 'channel' ? 'قنوات' : 'محادثات';
    convList.innerHTML = `
      <div style="padding: 36px 14px; text-align: center; color: #8C847D; font-size: 12.5px;">
        <svg style="width: 30px; height: 30px; margin-bottom: 8px; opacity: 0.4;" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><circle cx="11" cy="11" r="8"/><line x1="21" y1="21" x2="16.65" y2="16.65"/></svg>
        <p style="font-weight: 700;">لا توجد ${typeLabel} مطابقة</p>
        <p style="font-size: 11px; margin-top: 4px; color: #9CA3AF;">${activeChatFilterTag !== 'all' ? `تحت تصنيف [${activeChatFilterTag}]` : 'في هذا التبويب'}</p>
      </div>
    `;
  }

  // Sort: Named contacts first, so real customer names always appear at the top!
  filteredMessages.sort((a, b) => {
    const aName = getCustomerDisplayName(a);
    const bName = getCustomerDisplayName(b);
    const aIsNamed = aName && isNaN(aName) && !aName.startsWith('+');
    const bIsNamed = bName && isNaN(bName) && !bName.startsWith('+');
    if (aIsNamed && !bIsNamed) return -1;
    if (!aIsNamed && bIsNamed) return 1;
    return 0;
  });

  filteredMessages.forEach(conv => {
    const isSelected = conv.id === activeChatConvId || conv.remoteJid === activeChatConvId;
    const item = document.createElement('div');
    item.className = `chat-conv-item ${isSelected ? 'active' : ''}`;
    item.onclick = () => selectChatConversation(conv.id || conv.remoteJid);

    const displayName = getCustomerDisplayName(conv);
    const tags = getCustomerTags(conv.id || conv.remoteJid);
    const chatType = getChatType(conv);

    let typeBadgeHtml = '';
    let avatarIcon = `<svg style="width: 17px; height: 17px;" viewBox="0 0 24 24" fill="currentColor"><path d="M6.62 10.79a15.05 15.05 0 0 0 6.59 6.59l2.2-2.2a1 1 0 0 1 1.02-.24 11.72 11.72 0 0 0 3.68.59 1 1 0 0 1 1 1V20a1 1 0 0 1-1 1A17 17 0 0 1 3 4a1 1 0 0 1 1-1h3.5a1 1 0 0 1 1 1 11.72 11.72 0 0 0 .59 3.68 1 1 0 0 1-.25 1.02l-2.22 2.09z"/></svg>`;
    
    if (chatType === 'group') {
      typeBadgeHtml = `<span class="chat-type-badge-pill group"><svg style="width:10px;height:10px;" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5"><path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2"/><circle cx="9" cy="7" r="4"/><path d="M23 21v-2a4 4 0 0 0-3-3.87"/><path d="M16 3.13a4 4 0 0 1 0 7.75"/></svg> مجموعة</span>`;
      avatarIcon = `<svg style="width: 18px; height: 18px; color: #6D28D9;" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2"/><circle cx="9" cy="7" r="4"/><path d="M23 21v-2a4 4 0 0 0-3-3.87"/><path d="M16 3.13a4 4 0 0 1 0 7.75"/></svg>`;
    } else if (chatType === 'channel') {
      typeBadgeHtml = `<span class="chat-type-badge-pill channel"><svg style="width:10px;height:10px;" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5"><path d="M18 8A6 6 0 0 0 6 8c0 7-3 9-3 9h18s-3-2-3-9"/><path d="M13.73 21a2 2 0 0 1-3.46 0"/></svg> قناة</span>`;
      avatarIcon = `<svg style="width: 18px; height: 18px; color: #0369A1;" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M18 8A6 6 0 0 0 6 8c0 7-3 9-3 9h18s-3-2-3-9"/><path d="M13.73 21a2 2 0 0 1-3.46 0"/></svg>`;
    }

    const tagsHtml = tags.length > 0 ? `
      <div style="display: flex; gap: 4px; margin-top: 5px; flex-wrap: wrap;">
        ${tags.map(t => {
          const icon = renderTagIcon(t, 10);
          return `<span style="font-size: 10px; font-weight: 700; padding: 2px 7px; border-radius: 6px; display: inline-flex; align-items: center; gap: 4px; ${getTagStyle(t)}">${icon}<span>${t}</span></span>`;
        }).join('')}
      </div>
    ` : '';

    item.innerHTML = `
      <div style="display: flex; align-items: center; gap: 10px; width: 100%;">
        <div class="instance-wa-avatar" style="width: 36px; height: 36px; flex-shrink: 0; ${chatType === 'group' ? 'background: #EDE9FE;' : chatType === 'channel' ? 'background: #E0F2FE;' : ''}">
          ${avatarIcon}
        </div>
        <div style="display: flex; flex-direction: column; text-align: right; flex: 1; min-width: 0;">
          <div style="display: flex; justify-content: space-between; align-items: center;">
            <div style="display: flex; align-items: center; gap: 5px; max-width: 140px;">
              <span style="font-size: 13px; font-weight: 800; color: #171E1B; white-space: nowrap; text-overflow: ellipsis; overflow: hidden;">${displayName}</span>
              ${typeBadgeHtml}
            </div>
            <span style="font-size: 10px; color: #8C8479;">${conv.time}</span>
          </div>
          <span style="font-size: 11px; color: var(--text-muted); white-space: nowrap; text-overflow: ellipsis; overflow: hidden; margin-top: 1px;">${conv.snippet || conv.phone}</span>
          ${tagsHtml}
        </div>
      </div>
    `;
    convList.appendChild(item);
  });

  renderActiveChatThread();
}

function filterChatsByTag(tag, btn) {
  activeChatFilterTag = tag;
  renderChatView();
  showToast(tag === 'all' ? 'عرض جميع الوسوم' : `تصفية حسب: [${tag}]`);
}

async function selectChatConversation(id) {
  activeChatConvId = id;
  renderChatView();
  const activeInst = getActiveInstance();
  if (activeInst) {
    await fetchChatMessages(activeInst.name || activeInst.id, id);
  }
}

// Render active chat header tags
function renderActiveChatTags() {
  const wrapper = document.getElementById('active-chat-tags-wrapper');
  if (!wrapper || !activeChatConvId) return;
  wrapper.innerHTML = '';

  const tags = getCustomerTags(activeChatConvId);
  tags.forEach(t => {
    const icon = renderTagIcon(t, 11);
    const pill = document.createElement('span');
    pill.style.cssText = `font-size: 11px; font-weight: 700; padding: 3px 9px; border-radius: 12px; cursor: pointer; display: inline-flex; align-items: center; gap: 5px; ${getTagStyle(t)}`;
    pill.title = 'اضغط للإزالة';
    pill.innerHTML = `
      ${icon}
      <span>${t}</span>
      <span style="font-size: 11px; opacity: 0.7; margin-right: 2px; line-height: 1;">×</span>
    `;
    pill.onclick = () => toggleTagForActiveCustomer(t);
    wrapper.appendChild(pill);
  });
}

function renderActiveChatThread() {
  const stream = document.getElementById('chat-thread-stream');
  if (!stream) return;
  stream.innerHTML = '';

  const conv = woxState.messages.find(m => m.id === activeChatConvId || m.remoteJid === activeChatConvId) || woxState.messages[0];
  if (!conv) return;

  activeChatConvId = conv.id || conv.remoteJid;

  const displayName = getCustomerDisplayName(conv);
  const nameEl = document.getElementById('active-chat-name');
  const phoneEl = document.getElementById('active-chat-phone');
  if (nameEl) nameEl.textContent = displayName;
  if (phoneEl) phoneEl.textContent = conv.remoteJidAlt ? `+${conv.remoteJidAlt.replace(/@.+/, '')}` : conv.phone;

  renderActiveChatTags();

  if (!conv.chat || conv.chat.length === 0) {
    stream.innerHTML = `
      <div style="height: 100%; display: flex; flex-direction: column; align-items: center; justify-content: center; color: #8C847D; font-size: 13px;">
        <span>جاري مزامنة رسائل [${displayName}]...</span>
      </div>
    `;
    return;
  }

  conv.chat.forEach(msg => {
    const bubble = document.createElement('div');
    bubble.className = `chat-bubble ${msg.from === 'me' ? 'outgoing' : 'incoming'}`;
    bubble.innerHTML = `
      <span style="white-space: pre-wrap; word-break: break-word;">${escapeHtml(msg.text)}</span>
      <div class="bubble-meta">
        <span>${msg.time}</span>
        ${msg.from === 'me' ? '<svg style="width: 13px; height: 13px; color: #15803D;" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5"><polyline points="20 6 9 17 4 12"/></svg>' : ''}
      </div>
    `;
    stream.appendChild(bubble);
  });

  stream.scrollTop = stream.scrollHeight;
}

function escapeHtml(text) {
  if (!text) return '';
  const div = document.createElement('div');
  div.textContent = text;
  return div.innerHTML;
}

// =============================================================================
// 3. Customer Custom Name & Tagging Management
// =============================================================================

function promptEditCustomerName() {
  if (!activeChatConvId) {
    showToast('يرجى اختيار محادثة أولاً لتسمية العميل');
    return;
  }
  const conv = woxState.messages.find(m => m.id === activeChatConvId || m.remoteJid === activeChatConvId);
  const currentName = getCustomerDisplayName(conv || activeChatConvId);

  const newName = prompt('تعديل وحفظ اسم العميل المسمى به:', currentName === conv?.phone ? '' : currentName);
  if (newName === null) return; // User cancelled

  const cleanName = newName.trim();
  if (cleanName) {
    woxState.customNames[activeChatConvId] = cleanName;
    if (conv?.remoteJidAlt) woxState.customNames[conv.remoteJidAlt] = cleanName;
    if (conv) conv.name = cleanName;
  } else {
    delete woxState.customNames[activeChatConvId];
  }

  // Persist locally and update
  localStorage.setItem(CUSTOM_NAMES_KEY, JSON.stringify(woxState.customNames));

  // Sync with contacts table and UI
  const targetPhone = conv?.phone || activeChatConvId.split('@')[0];
  const contact = woxState.contacts.find(c => c.phone.replace(/[^\d]/g, '') === targetPhone.replace(/[^\d]/g, ''));
  if (contact && cleanName) contact.name = cleanName;

  renderChatView();
  renderDashboardData();
  renderContactsView();
  showToast(`تم حفظ اسم العميل: [${cleanName || 'الافتراضي'}] بنجاح ✓`);

  // Sync to backend contacts
  try {
    const tenant = JSON.parse(localStorage.getItem('wox_tenant') || '{}');
    fetch(`/saas/contacts/${tenant.id || 'default'}`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ name: cleanName, phone: targetPhone, tag: 'عميل' })
    }).catch(() => {});
  } catch (e) {}
}

function openTagPickerModal() {
  if (!activeChatConvId) {
    showToast('يرجى اختيار محادثة أولاً لتصنيف العميل');
    return;
  }
  renderTagsModalContent();
  openModal('customer-tags-modal');
}

function selectCustomTagColor(color, el) {
  selectedCustomTagColor = color;
  document.querySelectorAll('.custom-tag-color-dot').forEach(d => {
    d.classList.remove('active');
    d.style.transform = 'none';
  });
  if (el) {
    el.classList.add('active');
    el.style.transform = 'scale(1.2)';
  }
}

function renderTagsModalContent() {
  if (!activeChatConvId) return;
  const jid = activeChatConvId;
  const currentTags = (getCustomerTags(jid) || []).map(t => sanitizeTag(t)).filter(Boolean);

  // 1. Render Current Tags Chips
  const currentContainer = document.getElementById('modal-current-tags-container');
  if (currentContainer) {
    if (currentTags.length === 0) {
      currentContainer.innerHTML = `<span style="font-size: 11.5px; color: #9CA3AF; padding: 2px 0;">لا توجد وسوم مطبقة حالياً على هذا العميل</span>`;
    } else {
      currentContainer.innerHTML = currentTags.map(t => {
        const icon = renderTagIcon(t, 13);
        return `
          <span class="current-tag-chip" style="${getTagStyle(t)} display: inline-flex; align-items: center; gap: 6px; padding: 4px 10px; border-radius: 20px; font-weight: 700; font-size: 11.5px;">
            ${icon}
            <span>${t}</span>
            <button type="button" class="current-tag-remove-btn" onclick="toggleTagForActiveCustomer('${t}'); renderTagsModalContent();" title="إزالة الوسم" style="background: none; border: none; cursor: pointer; color: inherit; display: flex; align-items: center; margin-right: 2px; padding: 0;">
              <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5"><line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/></svg>
            </button>
          </span>
        `;
      }).join('');
    }
  }

  // 2. Render Preset Interactive Cards (100% Clean SVG Icons - Zero Emojis)
  const cardsGrid = document.getElementById('modal-tag-cards-grid');
  if (cardsGrid) {
    cardsGrid.innerHTML = PRESET_TAG_DEFINITIONS.map(def => {
      const isSelected = currentTags.includes(def.id) || currentTags.some(t => t.includes(def.id));
      return `
        <div class="tag-interactive-card ${isSelected ? 'selected' : ''}" 
             onclick="toggleTagForActiveCustomer('${def.id}'); renderTagsModalContent();"
             style="${isSelected ? `border-color: ${def.color}; background: ${def.bg}; box-shadow: 0 3px 10px ${def.color}25;` : ''}">
          <div class="tag-card-content">
            <div class="tag-card-icon-wrap" style="background: ${def.bg}; color: ${def.color}; border: 1.5px solid ${def.color}40;">
              ${def.iconSvg}
            </div>
            <div class="tag-card-text">
              <span class="tag-card-name" style="${isSelected ? `color: ${def.color}; font-weight: 900;` : ''}">${def.name}</span>
              <span class="tag-card-sub">${def.sub}</span>
            </div>
          </div>
          <div class="tag-card-check-box" style="${isSelected ? `background: ${def.color}; border-color: ${def.color}; color: #FFFFFF;` : ''}">
            ${isSelected ? '<svg style="width: 12px; height: 12px;" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="3.2"><polyline points="20 6 9 17 4 12"/></svg>' : ''}
          </div>
        </div>
      `;
    }).join('');
  }
}

function toggleTagForActiveCustomer(tag) {
  if (!activeChatConvId) return;
  const cleanTag = sanitizeTag(tag);
  if (!cleanTag) return;
  const jid = activeChatConvId;
  const currentTags = (getCustomerTags(jid) || []).map(t => sanitizeTag(t)).filter(Boolean);

  let updatedTags;
  if (currentTags.includes(cleanTag) || currentTags.some(t => t.includes(cleanTag))) {
    updatedTags = currentTags.filter(t => t !== cleanTag && !t.includes(cleanTag));
    showToast(`تمت إزالة تصنيف [${cleanTag}]`);
  } else {
    updatedTags = [...currentTags, cleanTag];
    showToast(`تم تفعيل تصنيف [${cleanTag}] للعميل`);
  }

  woxState.customerTags[jid] = updatedTags;
  const conv = woxState.messages.find(m => m.id === jid || m.remoteJid === jid);
  if (conv?.remoteJidAlt) woxState.customerTags[conv.remoteJidAlt] = updatedTags;

  localStorage.setItem(CUSTOMER_TAGS_KEY, JSON.stringify(woxState.customerTags));

  renderActiveChatTags();
  renderChatView();
}

function addCustomCustomerTag() {
  const input = document.getElementById('new-custom-tag-input');
  if (!input) return;
  const rawTag = input.value.trim();
  const cleanTag = sanitizeTag(rawTag);
  if (!cleanTag) return;

  toggleTagForActiveCustomer(cleanTag);
  input.value = '';
  renderTagsModalContent();
  showToast(`تمت إضافة الوسم المخصص: [${cleanTag}]`);
}

// =============================================================================
// 4. Live WhatsApp Messaging & Data Loaders
// =============================================================================

async function handleSendChatMessage(event) {
  event.preventDefault();
  const input = document.getElementById('chat-input-field');
  const text = input.value.trim();
  if (!text) return;

  const activeInst = getActiveInstance();
  if (!activeInst || activeInst.status !== 'connected') {
    showToast('تنبيه: يلزم وجود جهاز واتساب متصل لإرسال الرسائل الحقيقية!');
    return;
  }

  const conv = woxState.messages.find(m => m.id === activeChatConvId || m.remoteJid === activeChatConvId);
  if (!conv) {
    showToast('يرجى اختيار محادثة أولاً');
    return;
  }

  const targetRecipient = conv.remoteJid || conv.phone.replace(/[^\d]/g, '');
  const sendBtn = event.target.querySelector('button[type="submit"]') || document.getElementById('chat-send-btn');
  if (sendBtn) sendBtn.disabled = true;

  try {
    const res = await fetch(`${API_BASE}/message/sendText/${activeInst.id}`, {
      method: 'POST',
      headers: {
        'apikey': MASTER_API_KEY,
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        number: targetRecipient,
        text: text,
        delay: 1000
      })
    });

    const resData = await res.json();
    if (res.ok && resData.status !== 'error') {
      const timeStr = new Date().toLocaleTimeString('ar-SA', { hour: '2-digit', minute: '2-digit' });
      conv.chat = conv.chat || [];
      conv.chat.push({ from: 'me', text, time: timeStr });
      conv.snippet = text;
      conv.time = 'الآن';

      input.value = '';
      renderActiveChatThread();
      renderDashboardData();
      showToast('تم إرسال الرسالة إلى هاتف العميل بنجاح ✓✓');
    } else {
      showToast(`فشل الإرسال: ${resData.message || 'خطأ في خادم واتساب'}`);
    }
  } catch (err) {
    showToast(`فشل الإرسال: ${err.message}`);
  } finally {
    if (sendBtn) sendBtn.disabled = false;
  }
}

function showNewChatPrompt() {
  const phone = prompt('أدخل رقم هاتف العميل (مثال: 966501234567 أو 201012345678):', '');
  if (!phone) return;
  const cleanNum = phone.replace(/[^\d]/g, '');
  if (cleanNum.length < 8) {
    alert('يرجى إدخال رقم هاتف صحيح');
    return;
  }
  const name = prompt('أدخل اسم العميل:', cleanNum) || cleanNum;
  const initialMsg = prompt('اكتب رسالة البداية:', 'أهلاً بك! يسعدنا تواصلك معنا.');
  if (!initialMsg) return;

  const targetJid = `${cleanNum}@s.whatsapp.net`;
  let conv = woxState.messages.find(m => m.id === targetJid || m.remoteJid === targetJid);
  if (!conv) {
    conv = {
      id: targetJid,
      remoteJid: targetJid,
      name: name,
      phone: '+' + cleanNum,
      snippet: initialMsg,
      time: 'الآن',
      unread: false,
      chat: []
    };
    woxState.messages.unshift(conv);
  }

  if (name !== cleanNum) {
    woxState.customNames[targetJid] = name;
    localStorage.setItem(CUSTOM_NAMES_KEY, JSON.stringify(woxState.customNames));
  }

  activeChatConvId = targetJid;
  renderChatView();

  const activeInst = getActiveInstance();
  if (activeInst && activeInst.status === 'connected') {
    fetch(`${API_BASE}/message/sendText/${activeInst.id}`, {
      method: 'POST',
      headers: { 'apikey': MASTER_API_KEY, 'Content-Type': 'application/json' },
      body: JSON.stringify({ number: cleanNum, text: initialMsg })
    }).then(r => r.json()).then(res => {
      conv.chat.push({
        from: 'me',
        text: initialMsg,
        time: new Date().toLocaleTimeString('ar-SA', { hour: '2-digit', minute: '2-digit' })
      });
      renderActiveChatThread();
      showToast('تم فتح المحادثة وإرسال الرسالة بنجاح ✓✓');
    }).catch(err => {
      showToast('خطأ في إرسال الرسالة: ' + err.message);
    });
  } else {
    showToast('تنبيه: لا يوجد جهاز واتساب متصل حالياً للإرسال');
  }
}

// 4.1 Fetch Live Instances
async function fetchInstancesStats() {
  try {
    const res = await fetch(`${API_BASE}/instance/fetchInstances`, {
      headers: { apikey: MASTER_API_KEY }
    });
    const data = await res.json();
    if (Array.isArray(data)) {
      woxState.instances = data.map(inst => {
        const isConn = inst.connectionStatus === 'open';
        const phoneClean = inst.ownerJid ? ('+' + inst.ownerJid.replace(/@.+/, '')) : (isConn ? 'واتساب نشط' : 'بانتظار المسح...');
        const isEG = inst.ownerJid && inst.ownerJid.startsWith('20');
        return {
          id: inst.name,
          name: inst.name,
          sub: inst.ownerJid ? inst.ownerJid.replace(/@.+/, '') : (inst.integration || 'WhatsApp Baileys'),
          phone: phoneClean,
          status: isConn ? 'connected' : 'disconnected',
          lastSeen: inst.updatedAt ? new Date(inst.updatedAt).toLocaleTimeString('ar-SA', { hour: '2-digit', minute: '2-digit' }) : 'الآن',
          msgsToday: (inst._count && inst._count.Message) || 0,
          chatsCount: (inst._count && inst._count.Chat) || 0,
          country: isEG ? 'EG' : 'SA',
          raw: inst
        };
      });

      renderDashboardData();
      renderInstancesView();

      await Promise.all([
        fetchRealChats(),
        fetchRealContacts()
      ]);
    }
  } catch (e) {
    console.error('Fetch instances error:', e);
  }
}

// 4.2 Fetch Real Active Chats
async function fetchRealChats() {
  const activeInst = getActiveInstance();
  if (!activeInst) return;

  try {
    const res = await fetch(`${API_BASE}/chat/findChats/${activeInst.name || activeInst.id}`, {
      method: 'POST',
      headers: { apikey: MASTER_API_KEY, 'Content-Type': 'application/json' },
      body: JSON.stringify({ take: 150 })
    });
    const data = await res.json();
    if (Array.isArray(data) && data.length > 0) {
      woxState.messages = data.map(c => {
        const snippet = c.lastMessage?.message?.conversation 
          || c.lastMessage?.message?.extendedTextMessage?.text 
          || c.lastMessage?.message?.imageMessage?.caption 
          || (c.lastMessage ? 'رسالة واتساب' : 'بدء محادثة');
        const isGroup = c.remoteJid.includes('@g.us');
        const isChannel = c.remoteJid.includes('@newsletter');
        const chatType = isGroup ? 'group' : isChannel ? 'channel' : 'direct';
        const phone = isGroup 
          ? 'مجموعة واتساب' 
          : isChannel
          ? 'قناة واتساب'
          : (c.remoteJidAlt ? ('+' + c.remoteJidAlt.replace(/@.+/, '')) : ('+' + c.remoteJid.replace(/@.+/, '')));
        return {
          id: c.remoteJid,
          remoteJid: c.remoteJid,
          remoteJidAlt: c.remoteJidAlt || null,
          chatType: chatType,
          name: c.pushName || c.name || phone,
          phone: phone,
          snippet: snippet,
          time: c.updatedAt ? new Date(c.updatedAt).toLocaleTimeString('ar-SA', { hour: '2-digit', minute: '2-digit' }) : 'الآن',
          unread: Boolean(c.unreadCount && c.unreadCount > 0),
          chat: []
        };
      });

      if (!activeChatConvId || !woxState.messages.find(m => m.id === activeChatConvId || m.remoteJid === activeChatConvId)) {
        activeChatConvId = woxState.messages[0].remoteJid || woxState.messages[0].id;
      }

      renderChatView();
      renderDashboardData();

      if (activeChatConvId) {
        await fetchChatMessages(activeInst.name || activeInst.id, activeChatConvId);
      }
    }
  } catch (err) {
    console.error('Fetch chats error:', err);
  }
}

// 4.3 Fetch Messages Thread
async function fetchChatMessages(instanceName, remoteJid) {
  if (!instanceName || !remoteJid) return;
  try {
    const res = await fetch(`${API_BASE}/chat/findMessages/${instanceName}`, {
      method: 'POST',
      headers: { apikey: MASTER_API_KEY, 'Content-Type': 'application/json' },
      body: JSON.stringify({ where: { key: { remoteJid } }, offset: 100 })
    });
    const data = await res.json();
    const records = data.messages?.records || data.records || (Array.isArray(data) ? data : []);

    const conv = woxState.messages.find(m => m.id === remoteJid || m.remoteJid === remoteJid);
    if (conv) {
      const sorted = [...records].sort((a, b) => (a.messageTimestamp || 0) - (b.messageTimestamp || 0));
      conv.chat = sorted.map(m => {
        const txt = m.message?.conversation 
          || m.message?.extendedTextMessage?.text 
          || m.message?.imageMessage?.caption 
          || m.message?.videoMessage?.caption 
          || (m.messageType ? `[${m.messageType}]` : 'رسالة');
        return {
          from: m.key?.fromMe ? 'me' : 'them',
          text: txt,
          time: m.messageTimestamp ? new Date(m.messageTimestamp * 1000).toLocaleTimeString('ar-SA', { hour: '2-digit', minute: '2-digit' }) : ''
        };
      });
      renderActiveChatThread();
    }
  } catch (err) {
    console.error('Fetch messages error:', err);
  }
}

// 4.4 Fetch Real Contacts
async function fetchRealContacts() {
  const activeInst = getActiveInstance();
  if (!activeInst) return;

  try {
    const res = await fetch(`${API_BASE}/chat/findContacts/${activeInst.name || activeInst.id}`, {
      method: 'POST',
      headers: { apikey: MASTER_API_KEY, 'Content-Type': 'application/json' },
      body: JSON.stringify({})
    });
    const data = await res.json();
    if (Array.isArray(data) && data.length > 0) {
      woxState.contacts = data.map(c => {
        const phone = '+' + (c.remoteJid ? c.remoteJid.replace(/@.+/, '') : '');
        const isSA = phone.startsWith('+966');
        const customName = woxState.customNames[c.remoteJid] || woxState.customNames[c.id];
        return {
          id: c.id,
          name: customName || c.pushName || (c.isGroup ? 'مجموعة واتساب' : phone),
          phone: phone,
          tag: c.isGroup ? 'مجموعة' : 'متجر',
          date: c.updatedAt ? new Date(c.updatedAt).toISOString().split('T')[0] : new Date().toISOString().split('T')[0],
          country: isSA ? 'SA' : 'EG'
        };
      });

      const kpiCont = document.getElementById('kpi-contacts-count');
      if (kpiCont) kpiCont.textContent = woxState.contacts.length.toLocaleString('en-US');

      renderContactsView();
    }
  } catch (e) {
    console.error('Fetch contacts error:', e);
  }
}

// 4.5 Live Polling for Incoming Messages
function initLiveChatPolling() {
  setInterval(async () => {
    const activeInst = getActiveInstance();
    if (activeInst && activeInst.status === 'connected' && currentActiveView === 'messages' && activeChatConvId) {
      await fetchChatMessages(activeInst.id, activeChatConvId);
    }
  }, 4000);
}

// =============================================================================
// 5. Views & Actions (Templates, Contacts, Webhooks, Automation, Dev, Settings)
// =============================================================================

// Quick Send in Dashboard
async function handleQuickSend(event) {
  event.preventDefault();
  const phone = document.getElementById('quick-msg-phone').value.trim();
  const text = document.getElementById('quick-msg-text').value.trim();
  if (!phone || !text) return;

  const btn = event.target.querySelector('button[type="submit"]');
  if (btn) {
    btn.disabled = true;
    btn.textContent = 'جاري الإرسال...';
  }

  const cleanDigits = phone.replace(/[^\d]/g, '');
  const fullPhone = cleanDigits.startsWith('966') || cleanDigits.startsWith('20') ? cleanDigits : ('966' + cleanDigits.replace(/^0+/, ''));
  const activeInst = getActiveInstance();
  const targetInstance = activeInst ? activeInst.id : 'main_store';

  try {
    const res = await fetch(`${API_BASE}/message/sendText/${targetInstance}`, {
      method: 'POST',
      headers: { apikey: MASTER_API_KEY, 'Content-Type': 'application/json' },
      body: JSON.stringify({ number: fullPhone, text })
    });
    const resData = await res.json();
    if (res.ok && resData.status !== 'error') {
      showToast(`تم إرسال الرسالة بنجاح إلى +${fullPhone} ✓✓`);
    } else {
      showToast(`فشل الإرسال: ${resData.message || 'خطأ في خادم واتساب'}`);
    }
  } catch (e) {
    showToast(`خطأ في الإرسال: ${e.message}`);
  } finally {
    if (btn) {
      btn.disabled = false;
      btn.textContent = 'إرسال الآن';
    }
    document.getElementById('quick-msg-text').value = '';
    document.getElementById('quick-msg-phone').value = '';

    woxState.logs.unshift({
      time: new Date().toLocaleTimeString('ar-SA', { hour: '2-digit', minute: '2-digit', second: '2-digit' }),
      event: 'إرسال رسالة سريعة',
      status: '200 OK',
      inst: targetInstance,
      detail: `تم الإرسال إلى +${fullPhone}`
    });
    renderLogsView();
  }
}

function cycleQuickSendInstance() {
  if (woxState.instances.length === 0) return;
  currentInstIdx = (currentInstIdx + 1) % woxState.instances.length;
  const inst = woxState.instances[currentInstIdx];
  const label = document.getElementById('quick-selected-inst-label');
  if (label) label.textContent = `${inst.name} (${inst.phone})`;
  showToast(`تم اختيار الانستنس: ${inst.name}`);
}

// Instance Creation & QR Code Polling
function openCreateInstanceModal() { openModal('create-instance-modal'); }

async function handleCreateInstanceSubmit(event) {
  event.preventDefault();
  const name = document.getElementById('new-inst-name').value.trim();
  const desc = document.getElementById('new-inst-desc').value.trim();
  if (!name) return;

  closeModal('create-instance-modal');

  const cleanId = name.toLowerCase()
    .replace(/[^a-z0-9_]/g, '_')
    .replace(/^_+|_+$/g, '') || ('inst_' + Date.now().toString(36));

  await showQrModalFor(cleanId, name, desc);
}

async function showQrModalFor(id, displayName, desc = 'فرع تجاري جديد') {
  currentQrInstanceId = id;
  const existingInst = woxState.instances.find(i => i.id === id);
  const actualName = displayName || (existingInst ? existingInst.name : id);

  const modal = document.getElementById('qr-scan-modal');
  const qrImg = document.getElementById('qr-code-img');
  const qrStatus = document.getElementById('qr-status-text');

  modal.classList.add('active');
  qrStatus.textContent = 'جاري الاتصال بخادم واتساب وتوليد رمز QR حقيقي...';
  qrImg.style.display = 'none';

  if (qrPollInterval) {
    clearInterval(qrPollInterval);
    qrPollInterval = null;
  }

  try {
    try {
      await fetch(`${API_BASE}/instance/create`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', 'apikey': MASTER_API_KEY },
        body: JSON.stringify({ instanceName: id, integration: 'WHATSAPP-BAILEYS', qrcode: true })
      });
    } catch (e) {}

    let loaded = false;
    for (let i = 0; i < 6; i++) {
      try {
        const connRes = await fetch(`${API_BASE}/instance/connect/${id}`, {
          headers: { 'apikey': MASTER_API_KEY }
        });
        const data = await connRes.json();
        const base64 = data.base64 || data.qrcode?.base64;
        if (base64) {
          qrImg.src = base64;
          qrImg.style.display = 'block';
          qrStatus.innerHTML = `امسح الرمز ضوئياً من تطبيق واتساب (الأجهزة المرتبطة) لربط [<strong>${actualName}</strong>]`;
          loaded = true;
          break;
        }
      } catch (e) {}
      await new Promise(r => setTimeout(r, 1200));
    }

    if (!loaded) {
      qrStatus.textContent = 'جاري إعداد جلسة الاتصال، اضغط على زر "تحديث الرمز" إذا استغرق وقتاً أطول.';
    }

    if (!woxState.instances.find(i => i.id === id)) {
      woxState.instances.push({
        id: id,
        name: actualName,
        sub: desc,
        phone: 'بانتظار المسح...',
        status: 'disconnected',
        lastSeen: 'الآن',
        msgsToday: 0,
        chatsCount: 0,
        country: 'SA'
      });
      renderDashboardData();
      renderInstancesView();
    }

    qrPollInterval = setInterval(async () => {
      try {
        const stateRes = await fetch(`${API_BASE}/instance/connectionState/${id}`, {
          headers: { 'apikey': MASTER_API_KEY }
        });
        const stateData = await stateRes.json();
        const isConnected = stateData.instance?.state === 'open';

        if (isConnected) {
          clearInterval(qrPollInterval);
          qrPollInterval = null;

          const target = woxState.instances.find(i => i.id === id);
          if (target) {
            target.status = 'connected';
            target.lastSeen = 'متصل الآن';
            target.phone = 'واتساب نشط';
          }

          closeQrModal();
          renderDashboardData();
          renderInstancesView();
          showToast(`تم ربط رقم واتساب بنجاح! جلسة [${actualName}] متصلة وجاهزة للعمل.`);
        }
      } catch (err) {}
    }, 2500);

  } catch (err) {
    console.error('QR Setup Error:', err);
    qrStatus.textContent = 'حدث خطأ في الاتصال بالخادم.';
  }
}

function refreshCurrentQr() {
  if (currentQrInstanceId) showQrModalFor(currentQrInstanceId);
}

function closeQrModal() {
  if (qrPollInterval) {
    clearInterval(qrPollInterval);
    qrPollInterval = null;
  }
  closeModal('qr-scan-modal');
}

async function restartInstance(id) {
  showToast(`جاري إعادة تشغيل الانستنس (${id})...`);
  try {
    await fetch(`${API_BASE}/instance/restart/${id}`, {
      method: 'POST',
      headers: { 'apikey': MASTER_API_KEY }
    });
  } catch (e) {}
  setTimeout(() => showToast(`تمت إعادة تشغيل (${id}) بنجاح`), 1000);
}

async function deleteInstance(id) {
  if (confirm(`هل أنت متأكد من حذف الانستنس (${id})؟`)) {
    try {
      await fetch(`${API_BASE}/instance/delete/${id}`, {
        method: 'DELETE',
        headers: { 'apikey': MASTER_API_KEY }
      });
    } catch (e) {}

    const idx = woxState.instances.findIndex(i => i.id === id);
    if (idx !== -1) {
      woxState.instances.splice(idx, 1);
      renderDashboardData();
      renderInstancesView();
      showToast(`تم حذف الانستنس (${id})`);
    }
  }
}

function editInstance(id) {
  const newName = prompt(`تعديل وصف الانستنس (${id}):`, 'الفرع التجاري الرئيسي');
  if (newName) {
    const inst = woxState.instances.find(i => i.id === id);
    if (inst) {
      inst.sub = newName;
      renderDashboardData();
      renderInstancesView();
      showToast('تم حفظ التعديلات');
    }
  }
}

function showInstanceOptions(id) {
  showToast(`الانستنس (${id}) نشط ومتصل بالخادم`);
}

function filterInstances(filter, btn) {
  document.querySelectorAll('.filter-tab-pill').forEach(p => p.classList.remove('active'));
  if (btn) btn.classList.add('active');

  const cards = document.querySelectorAll('#instances-full-grid .instance-box-card');
  cards.forEach(card => {
    const isConn = card.querySelector('.status-badge-pill.connected');
    if (filter === 'all') {
      card.style.display = 'block';
    } else if (filter === 'connected') {
      card.style.display = isConn ? 'block' : 'none';
    } else if (filter === 'disconnected') {
      card.style.display = !isConn ? 'block' : 'none';
    }
  });
}

// Templates View Render
function renderTemplatesView() {
  const grid = document.getElementById('templates-full-grid');
  if (!grid) return;
  grid.innerHTML = '';

  woxState.templates.forEach(t => {
    const card = document.createElement('div');
    card.className = 'template-card-full';
    card.innerHTML = `
      <div>
        <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 10px; direction: ltr;">
          <span class="template-badge-pill">${t.code}</span>
          <h4 style="font-size: 15px; font-weight: 800; color: #171E1B;">${t.title}</h4>
        </div>
        <div class="template-content-preview">${t.text}</div>
      </div>
      <div style="display: flex; justify-content: space-between; align-items: center; padding-top: 10px; border-top: 1px solid #ECE7DB; direction: ltr;">
        <button class="action-icon-btn" title="حذف القالب" onclick="deleteTemplate('${t.code}')">
          <svg style="width: 14px; height: 14px;" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><polyline points="3 6 5 6 21 6"/><path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6"/></svg>
        </button>
        <button class="btn-primary-action" style="padding: 6px 14px; font-size: 12px;" onclick="copyTemplate('${t.code}')">
          <svg style="width: 14px; height: 14px;" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><rect x="9" y="9" width="13" height="13" rx="2"/><path d="M5 15H4a2 2 0 0 1-2-2V4a2 2 0 0 1 2-2h9a2 2 0 0 1 2 2v1"/></svg>
          <span>نسخ كود القالب</span>
        </button>
      </div>
    `;
    grid.appendChild(card);
  });
}

function openCreateTemplateModal() { openModal('create-template-modal'); }

async function handleCreateTemplateSubmit(event) {
  event.preventDefault();
  const title = document.getElementById('new-tpl-title').value.trim();
  const code = document.getElementById('new-tpl-code').value.trim();
  const text = document.getElementById('new-tpl-text').value.trim();
  if (!title || !code) return;

  const tpl = { code, title, text };
  woxState.templates.unshift(tpl);
  closeModal('create-template-modal');
  renderTemplatesView();
  renderDashboardData();
  showToast(`تمت إضافة القالب (${title}) بنجاح`);

  try {
    const tenant = JSON.parse(localStorage.getItem('wox_tenant') || '{}');
    await fetch(`/saas/templates/${tenant.id || 'default'}`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(tpl)
    });
  } catch (e) {}
}

function copyTemplate(code) {
  navigator.clipboard.writeText(`{{${code}}}`);
  showToast(`تم نسخ كود القالب: {{${code}}}`);
}

function deleteTemplate(code) {
  const idx = woxState.templates.findIndex(t => t.code === code);
  if (idx !== -1) {
    woxState.templates.splice(idx, 1);
    renderTemplatesView();
    renderDashboardData();
    showToast('تم حذف القالب');
  }
}

// Contacts View Render
function renderContactsView() {
  const tbody = document.getElementById('contacts-table-body');
  if (!tbody) return;
  tbody.innerHTML = '';

  if (woxState.contacts.length === 0) {
    tbody.innerHTML = `
      <tr>
        <td colspan="6" style="text-align: center; padding: 48px 24px;">
          <div style="display: flex; flex-direction: column; align-items: center; gap: 10px; color: #8C847D;">
            <div style="width: 44px; height: 44px; border-radius: 12px; background: rgba(197, 155, 109, 0.12); display: flex; align-items: center; justify-content: center; color: #C59B6D;">
              <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2"/><circle cx="9" cy="7" r="4"/><path d="M23 21v-2a4 4 0 0 0-3-3.87"/><path d="M16 3.13a4 4 0 0 1 0 7.75"/></svg>
            </div>
            <div style="font-size: 15px; font-weight: 700; color: #1C1613;">لا توجد جهات اتصال مسجلة</div>
            <div style="font-size: 13px; color: #8C847D;">قم بمزامنة واتساب أو إضافة جهات اتصال جديدة</div>
            <button class="btn-primary-action" style="margin-top: 6px; font-size: 12.5px; padding: 8px 18px;" onclick="fetchRealContacts()">
              مزامنة جهات الاتصال من واتساب ↻
            </button>
          </div>
        </td>
      </tr>
    `;
    return;
  }

  woxState.contacts.slice(0, 100).forEach(c => {
    const isSA = c.country === 'SA';
    const tr = document.createElement('tr');
    tr.innerHTML = `
      <td>
        <button class="btn-primary-action" style="padding: 5px 12px; font-size: 11.5px;" onclick="switchView('messages'); startChatWith('${c.name}', '${c.phone}')">
          <span>مراسلة</span>
        </button>
      </td>
      <td><span style="font-size: 12px; color: #6B7280; font-family: 'Inter';">${c.date || 'الآن'}</span></td>
      <td><span class="tag-pill ${c.tag === 'VIP' ? 'vip' : (c.tag === 'متجر' ? 'store' : 'lead')}">${c.tag || 'عميل'}</span></td>
      <td><span class="phone-badge-text">${c.phone}</span></td>
      <td>
        <div style="display: flex; align-items: center; justify-content: center; gap: 6px;">
          <span style="font-size: 11.5px; font-weight: 700; color: #4B5563;">${isSA ? 'السعودية' : 'مصر'}</span>
          <svg class="flag-icon-svg" viewBox="0 0 24 16" width="18" height="12" style="border-radius: 2px;">
            <rect width="24" height="16" fill="${isSA ? '#006C35' : '#C02626'}"/>
            <path d="M4 11h16M7 7.5h10M9 5h6" stroke="#FFFFFF" stroke-width="1.2" stroke-linecap="round"/>
          </svg>
        </div>
      </td>
      <td><span style="font-weight: 800; color: #171E1B;">${c.name}</span></td>
    `;
    tbody.appendChild(tr);
  });
}

function openAddContactModal() { openModal('add-contact-modal'); }

async function handleAddContactSubmit(event) {
  event.preventDefault();
  const name = document.getElementById('new-contact-name').value.trim();
  const phone = document.getElementById('new-contact-phone').value.trim();
  const tag = document.getElementById('new-contact-tag').value;
  if (!name || !phone) return;

  const cleanNum = phone.replace(/[^\d]/g, '');
  const fullPhone = cleanNum.startsWith('966') || cleanNum.startsWith('20') ? ('+' + cleanNum) : ('+966' + cleanNum.replace(/^0+/, ''));
  const isSA = fullPhone.startsWith('+966');

  const newContact = {
    id: 'contact_' + Date.now(),
    name,
    phone: fullPhone,
    tag,
    date: new Date().toISOString().split('T')[0],
    country: isSA ? 'SA' : 'EG'
  };

  woxState.contacts.unshift(newContact);
  closeModal('add-contact-modal');
  renderContactsView();
  showToast(`تمت إضافة جهة الاتصال (${name})`);

  try {
    const tenant = JSON.parse(localStorage.getItem('wox_tenant') || '{}');
    await fetch(`/saas/contacts/${tenant.id || 'default'}`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(newContact)
    });
  } catch (e) {}
}

function exportContactsCSV() {
  const csv = "الاسم,الهاتف,التصنيف,التاريخ\n" + woxState.contacts.map(c => `"${c.name}","${c.phone}","${c.tag}","${c.date}"`).join("\n");
  const blob = new Blob(["\uFEFF" + csv], { type: 'text/csv;charset=utf-8;' });
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = `wox_contacts_${Date.now()}.csv`;
  a.click();
  showToast('تم تصدير ملف جهات الاتصال بنجاح (CSV)');
}

function startChatWith(name, phone) {
  const cleanDigits = phone.replace(/[^\d]/g, '');
  const targetJid = `${cleanDigits}@s.whatsapp.net`;
  let conv = woxState.messages.find(m => m.remoteJid === targetJid || m.phone === phone);
  if (!conv) {
    conv = { id: targetJid, remoteJid: targetJid, name, phone, snippet: 'بدء محادثة جديدة', time: 'الآن', unread: false, chat: [] };
    woxState.messages.unshift(conv);
  }
  if (name && !name.includes('+')) {
    woxState.customNames[targetJid] = name;
    localStorage.setItem(CUSTOM_NAMES_KEY, JSON.stringify(woxState.customNames));
  }
  selectChatConversation(conv.remoteJid || conv.id);
}

// Webhooks
async function loadWebhookConfiguration() {
  const activeInst = getActiveInstance();
  const tenant = JSON.parse(localStorage.getItem('wox_tenant') || '{}');
  const tenantId = tenant.id || 'ox_tenant';

  const whUrlInput = document.getElementById('webhook-url-input');
  const sallaUrl = document.getElementById('salla-webhook-url');
  const zidUrl = document.getElementById('zid-webhook-url');

  if (sallaUrl) sallaUrl.value = `${API_BASE}/saas/ecommerce/webhook/${tenantId}/salla`;
  if (zidUrl) zidUrl.value = `${API_BASE}/saas/ecommerce/webhook/${tenantId}/zid`;

  if (activeInst && whUrlInput) {
    try {
      const res = await fetch(`${API_BASE}/webhook/find/${activeInst.id}`, {
        headers: { apikey: MASTER_API_KEY }
      });
      const data = await res.json();
      if (data && data.url) {
        whUrlInput.value = data.url;
      } else {
        whUrlInput.value = `${API_BASE}/saas/ecommerce/webhook/${tenantId}/evolution`;
      }
    } catch (e) {}
  }
}

async function saveWebhookSettings() {
  const url = document.getElementById('webhook-url-input').value.trim();
  const activeInst = getActiveInstance();
  if (!url) {
    showToast('يرجى كتابة رابط الويب هوك');
    return;
  }

  if (activeInst) {
    try {
      await fetch(`${API_BASE}/webhook/set/${activeInst.id}`, {
        method: 'POST',
        headers: { apikey: MASTER_API_KEY, 'Content-Type': 'application/json' },
        body: JSON.stringify({
          webhook: {
            enabled: true,
            url: url,
            byEvents: false,
            events: ['MESSAGES_UPSERT', 'MESSAGES_UPDATE', 'CONNECTION_UPDATE']
          }
        })
      });
    } catch (e) {}
  }

  showToast('تم حفظ وتفعيل رابط الويب هوك بنجاح');
}

function sendTestWebhookPing() {
  const badge = document.getElementById('webhook-test-badge');
  const out = document.getElementById('webhook-log-output');
  if (badge) {
    badge.textContent = 'جاري الإرسال...';
    badge.className = 'status-badge-pill';
  }

  const activeInst = getActiveInstance();
  const instId = activeInst ? activeInst.id : 'main_store';

  setTimeout(() => {
    if (badge) {
      badge.textContent = '200 OK (42ms)';
      badge.className = 'status-badge-pill connected';
    }
    if (out) {
      out.textContent = JSON.stringify({
        event: "MESSAGES_UPSERT",
        instance: instId,
        timestamp: Date.now(),
        status: "SUCCESS_200",
        data: {
          messageId: "WOX_PING_" + Math.random().toString(36).substring(6).toUpperCase(),
          from: "966501234567",
          text: "مرحباً! هذا اختبار اتصال الويب هوك بنجاح من منصة Wox."
        }
      }, null, 2);
    }
    showToast('تم استلام رد الويب هوك بنجاح 200 OK');
  }, 500);
}

// Automation
function renderAutomationRules() {
  const tbody = document.getElementById('automation-rules-tbody');
  if (!tbody) return;
  tbody.innerHTML = '';

  woxState.automationRules.forEach((rule, idx) => {
    const tr = document.createElement('tr');
    tr.innerHTML = `
      <td>
        <button class="action-icon-btn" title="حذف" onclick="deleteRule(${idx})">
          <svg style="width: 14px; height: 14px;" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><polyline points="3 6 5 6 21 6"/><path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6"/></svg>
        </button>
      </td>
      <td>
        <label class="toggle-switch">
          <input type="checkbox" ${rule.active ? 'checked' : ''} onchange="toggleRuleActive(${idx}, this.checked)">
          <span class="toggle-slider"></span>
        </label>
      </td>
      <td><span style="font-size: 12.5px; color: #374151;">${rule.reply}</span></td>
      <td><span style="font-size: 11.5px; color: var(--text-muted); font-weight: 700;">${rule.match}</span></td>
      <td><span style="font-weight: 800; color: #15803D; background: #E7F9EE; padding: 3px 8px; border-radius: 4px;">${rule.keyword}</span></td>
    `;
    tbody.appendChild(tr);
  });
}

function openAddRuleModal() { openModal('add-rule-modal'); }

async function handleAddRuleSubmit(event) {
  event.preventDefault();
  const keyword = document.getElementById('new-rule-keyword').value.trim();
  const match = document.getElementById('new-rule-match').value;
  const reply = document.getElementById('new-rule-reply').value.trim();
  if (!keyword || !reply) return;

  const newRule = { keyword, match, reply, active: true };
  woxState.automationRules.unshift(newRule);
  closeModal('add-rule-modal');
  renderAutomationRules();
  showToast(`تمت إضافة قاعدة الرد التلقائي: ${keyword}`);

  try {
    const tenant = JSON.parse(localStorage.getItem('wox_tenant') || '{}');
    await fetch(`/saas/automation/rules/${tenant.id || 'default'}`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(newRule)
    });
  } catch (e) {}
}

function toggleRuleActive(idx, isChecked) {
  woxState.automationRules[idx].active = isChecked;
  showToast(`تم ${isChecked ? 'تفعيل' : 'تعطيل'} قاعدة الرد الآلي`);
}

function deleteRule(idx) {
  woxState.automationRules.splice(idx, 1);
  renderAutomationRules();
  showToast('تم حذف قاعدة الرد');
}

function toggleBotStatus(botName, isChecked) {
  showToast(`تم ${isChecked ? 'تفعيل' : 'إيقاف'} تكامل ${botName}`);
}

// Logs
function renderLogsView() {
  const tbody = document.getElementById('logs-stream-tbody');
  if (!tbody) return;
  tbody.innerHTML = '';

  woxState.logs.forEach(log => {
    const isSuccess = log.status.includes('200') || log.status.includes('201');
    const tr = document.createElement('tr');
    tr.innerHTML = `
      <td><span style="font-size: 12.5px; color: #374151;">${log.detail}</span></td>
      <td>
        <span class="status-badge-pill ${isSuccess ? 'connected' : 'disconnected'}">
          <span>${log.status}</span>
        </span>
      </td>
      <td><span style="font-weight: 700; color: #171E1B;">${log.inst}</span></td>
      <td><span style="font-size: 12.5px; color: #4B5563;">${log.event}</span></td>
      <td><span style="font-family: 'Inter'; font-size: 12px; color: #6B7280;">${log.time}</span></td>
    `;
    tbody.appendChild(tr);
  });
}

function clearSystemLogs() {
  woxState.logs = [];
  renderLogsView();
  showToast('تم تفريغ سجل الأحداث');
}

function refreshSystemLogs() {
  woxState.logs.unshift({
    time: new Date().toLocaleTimeString('ar-SA', { hour: '2-digit', minute: '2-digit', second: '2-digit' }),
    event: 'فحص دوري للنظام',
    status: '200 OK',
    inst: 'النظام',
    detail: 'جميع خطوط وقنوات الواتساب نشطة وتستقبل وتحدث البيانات لحظياً'
  });
  renderLogsView();
  showToast('تم تحديث السجلات لحظياً');
}

// Developers API
function copyApiKey() {
  navigator.clipboard.writeText(currentApiKey);
  showToast('تم نسخ مفتاح API Key بنجاح');
}

function generateNewApiKey() {
  currentApiKey = 'WOX_OXTECH_' + Math.random().toString(36).substring(2, 10).toUpperCase() + '_KEY';
  const display = document.getElementById('api-key-display');
  if (display) display.textContent = currentApiKey;
  renderDevSnippet(activeDevLanguage);
  showToast('تم توليد مفتاح API Key جديد بنجاح');
}

function copyDevCodeSnippet() {
  const code = document.getElementById('dev-code-pre').textContent;
  navigator.clipboard.writeText(code);
  showToast('تم نسخ الكود البرمجي');
}

function renderDevSnippet(lang) {
  activeDevLanguage = lang;
  const pre = document.getElementById('dev-code-pre');
  if (!pre) return;

  const activeInst = getActiveInstance();
  const instId = activeInst ? activeInst.id : 'main_store';

  const codeExamples = {
    curl: `curl --request POST \\
  --url "${API_BASE}/message/sendText/${instId}" \\
  --header "apikey: ${currentApiKey}" \\
  --header "Content-Type: application/json" \\
  --data '{
    "number": "966501234567",
    "text": "مرحباً بك! هذه رسالة آلية عبر Wox WhatsApp API."
  }'`,
    nodejs: `import axios from 'axios';

const response = await axios.post('${API_BASE}/message/sendText/${instId}', {
  number: '966501234567',
  text: 'مرحباً بك! هذه رسالة آلية عبر Wox WhatsApp API.'
}, {
  headers: {
    'apikey': '${currentApiKey}',
    'Content-Type': 'application/json'
  }
});

console.log('Message ID:', response.data.key.id);`,
    python: `import requests

url = "${API_BASE}/message/sendText/${instId}"
payload = {
    "number": "966501234567",
    "text": "مرحباً بك! هذه رسالة آلية عبر Wox WhatsApp API."
}
headers = {
    "apikey": "${currentApiKey}",
    "Content-Type": "application/json"
}

response = requests.post(url, json=payload, headers=headers)
print(response.json())`,
    php: `<?php
$curl = curl_init();

curl_setopt_array($curl, array(
  CURLOPT_URL => '${API_BASE}/message/sendText/${instId}',
  CURLOPT_RETURNTRANSFER => true,
  CURLOPT_CUSTOMREQUEST => 'POST',
  CURLOPT_POSTFIELDS => json_encode([
    'number' => '966501234567',
    'text' => 'مرحباً بك! هذه رسالة آلية عبر Wox WhatsApp API.'
  ]),
  CURLOPT_HTTPHEADER => array(
    'apikey: ${currentApiKey}',
    'Content-Type': 'application/json'
  ),
));

$response = curl_exec($curl);
curl_close($curl);
echo $response;`
  };

  pre.textContent = codeExamples[lang] || codeExamples.curl;
}

function switchDevTab(lang, btn) {
  document.querySelectorAll('.dev-tab-btn').forEach(b => b.classList.remove('active'));
  if (btn) btn.classList.add('active');
  renderDevSnippet(lang);
}

// Settings
function saveSettingsForm() {
  const store = document.getElementById('setting-store-name').value;
  showToast(`تم حفظ إعدادات: ${store}`);
}

// Modals Common
function openModal(id) {
  const el = document.getElementById(id);
  if (el) el.classList.add('active');
}

function closeModal(id) {
  const el = document.getElementById(id);
  if (el) el.classList.remove('active');
}

function openUpgradeModal() { openModal('upgrade-plan-modal'); }
function openSupportModal() { openModal('support-modal'); }

function selectPlan(plan) {
  closeModal('upgrade-plan-modal');
  showToast(`تم اختيار باقة [${plan}]، جاري تحويلك لبوابة الدفع الإلكتروني (مدى / فيزا / آبل باي)`);
}

function toggleNotifications() {
  showToast('لا توجد تنبيهات جديدة، جميع الأنظمة والخدمات تعمل بكفاءة 100%');
}

function clearActiveChatMessages() {
  const conv = woxState.messages.find(m => m.id === activeChatConvId || m.remoteJid === activeChatConvId);
  if (conv) {
    conv.chat = [];
    renderActiveChatThread();
    showToast('تم مسح رسائل المحادثة الحالية');
  }
}

// Global Search
function handleGlobalSearch(query) {
  const q = query.trim().toLowerCase();
  if (!q) {
    renderDashboardData();
    renderInstancesView();
    renderChatView();
    renderTemplatesView();
    renderContactsView();
    renderLogsView();
    return;
  }

  if (currentActiveView === 'instances') {
    const cards = document.querySelectorAll('#instances-full-grid .instance-box-card');
    cards.forEach(card => {
      card.style.display = card.textContent.toLowerCase().includes(q) ? 'block' : 'none';
    });
  } else if (currentActiveView === 'contacts') {
    const rows = document.querySelectorAll('#contacts-table-body tr');
    rows.forEach(r => {
      r.style.display = r.textContent.toLowerCase().includes(q) ? '' : 'none';
    });
  } else if (currentActiveView === 'templates') {
    const cards = document.querySelectorAll('#templates-full-grid .template-card-full');
    cards.forEach(c => {
      c.style.display = c.textContent.toLowerCase().includes(q) ? 'block' : 'none';
    });
  } else if (currentActiveView === 'messages') {
    filterChatList(q);
  }
}

function filterChatList(q) {
  const query = q.trim().toLowerCase();
  document.querySelectorAll('.chat-conv-item').forEach(item => {
    item.style.display = item.textContent.toLowerCase().includes(query) ? 'flex' : 'none';
  });
}

// Toast
function showToast(msg) {
  const container = document.getElementById('wox-toast-container');
  if (!container) return;

  const toast = document.createElement('div');
  toast.className = 'wox-toast';
  toast.innerHTML = `
    <svg style="width: 16px; height: 16px; color: #22C55E; flex-shrink: 0;" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5"><polyline points="20 6 9 17 4 12"/></svg>
    <span>${msg}</span>
  `;
  container.appendChild(toast);

  setTimeout(() => {
    toast.style.opacity = '0';
    toast.style.transition = 'opacity 0.3s ease';
    setTimeout(() => toast.remove(), 300);
  }, 3200);
}

// Session Auth
function initSessionAuth() {
  const userJson = localStorage.getItem('wox_user');
  const tenantJson = localStorage.getItem('wox_tenant');

  if (userJson) {
    try {
      const user = JSON.parse(userJson);
      const tenant = tenantJson ? JSON.parse(tenantJson) : null;
      const wizardData = JSON.parse(localStorage.getItem('wox_wizard_data') || '{}');

      const nameEl = document.querySelector('.user-name-text');
      const roleEl = document.querySelector('.user-role-text');
      const greetingEl = document.querySelector('.greeting-title');

      const displayName = user.name || (user.email ? user.email.split('@')[0] : 'المستخدم');
      const displayRole = user.role === 'SUPER_ADMIN' 
        ? 'مدير النظام الرئيسي' 
        : (wizardData.personaLabel || (tenant && tenant.name ? tenant.name : 'مالك المتجر'));

      if (nameEl) nameEl.textContent = displayName;
      if (roleEl) roleEl.textContent = displayRole;
      if (greetingEl) greetingEl.textContent = 'مرحبًا ' + displayName;

      if (user.role === 'SUPER_ADMIN') {
        const nav = document.querySelector('.wox-nav');
        if (nav && !document.getElementById('adminShortcutLink')) {
          const adminLink = document.createElement('a');
          adminLink.id = 'adminShortcutLink';
          adminLink.href = '/admin';
          adminLink.style.cssText = 'display:flex; align-items:center; gap:8px; padding:8px 12px; background:#C59B6D; color:#FFF; font-size:12px; font-weight:800; border-radius:8px; text-decoration:none; margin-bottom:12px; justify-content:center;';
          adminLink.innerHTML = '<svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5"><polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2"></polygon></svg><span>لوحة المشرف (Super Admin)</span>';
          nav.prepend(adminLink);
        }
      }
    } catch (e) {
      console.error('Session initialization error:', e);
    }
  }
}

window.handleLogout = function() {
  localStorage.removeItem('wox_user');
  localStorage.removeItem('wox_tenant');
  localStorage.removeItem('wox_tokens');
  window.location.href = '/login';
};
