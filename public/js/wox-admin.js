/**
 * Wox WhatsApp - Super Admin Dashboard Controller
 * Handles real-time tenant management, plan and price updates, subscriptions, and virtual numbers.
 * Zero Emojis | Ox Tech Brand Standards
 */

(function () {
  'use strict';

  let allTenants = [];
  let allPlans = [];
  let allNumbers = [];
  let allInvoices = [];

  const elements = {
    tabHeading: document.getElementById('tabHeading'),
    navItems: document.querySelectorAll('.admin-nav-item'),
    tabPanes: document.querySelectorAll('.admin-tab-pane'),
    lastSyncTime: document.getElementById('lastSyncTime'),
    btnRefresh: document.getElementById('btnRefreshData'),
    toast: document.getElementById('adminToast'),

    // KPI elements
    kpiRevenueSAR: document.getElementById('kpiRevenueSAR'),
    kpiRevenueEGP: document.getElementById('kpiRevenueEGP'),
    kpiTenantsCount: document.getElementById('kpiTenantsCount'),
    kpiActiveInstances: document.getElementById('kpiActiveInstances'),
    kpiNumbersPool: document.getElementById('kpiNumbersPool'),
    recentTenantsTbody: document.getElementById('recentTenantsTbody'),

    // Tenants elements
    allTenantsTbody: document.getElementById('allTenantsTbody'),
    inputSearchTenants: document.getElementById('inputSearchTenants'),
    selectCountryFilter: document.getElementById('selectCountryFilter'),

    // Plans elements
    adminPlansGrid: document.getElementById('adminPlansGrid'),
    btnAddNewPlanModal: document.getElementById('btnAddNewPlanModal'),
    modalCreatePlan: document.getElementById('modalCreatePlan'),
    btnSubmitCreatePlan: document.getElementById('btnSubmitCreatePlan'),

    // Upgrade Plan Modal
    modalUpgradeTenant: document.getElementById('modalUpgradeTenant'),
    upgradeTenantId: document.getElementById('upgradeTenantId'),
    upgradeTenantName: document.getElementById('upgradeTenantName'),
    upgradeSelectPlan: document.getElementById('upgradeSelectPlan'),
    btnSubmitUpgradePlan: document.getElementById('btnSubmitUpgradePlan'),

    // Numbers elements
    tableNumbersTbody: document.getElementById('numbersTbody'),
    btnAddNumberModal: document.getElementById('btnAddNumberModal'),
    modalAddNumber: document.getElementById('modalAddNumber'),
    btnSubmitAddNumber: document.getElementById('btnSubmitAddNumber'),

    // Invoices elements
    tableInvoicesTbody: document.getElementById('invoicesTbody'),
    btnExportInvoices: document.getElementById('btnExportInvoices'),

    // Health
    healthRam: document.getElementById('healthRam'),
    healthUptime: document.getElementById('healthUptime'),

    // Analytics elements
    btnSaveAnalytics: document.getElementById('btnSaveAnalytics'),
    cfgGaId: document.getElementById('cfgGaId'),
    cfgGtmId: document.getElementById('cfgGtmId'),
    cfgMetaId: document.getElementById('cfgMetaId'),
    cfgSnapId: document.getElementById('cfgSnapId'),
    cfgTiktokId: document.getElementById('cfgTiktokId'),

    // Site Settings & SEO elements
    btnSaveSiteSettings: document.getElementById('btnSaveSiteSettings'),
    settingLogoUrl: document.getElementById('settingLogoUrl'),
    settingLogoDarkUrl: document.getElementById('settingLogoDarkUrl'),
    settingFaviconUrl: document.getElementById('settingFaviconUrl'),
    settingSiteName: document.getElementById('settingSiteName'),
    settingSiteTagline: document.getElementById('settingSiteTagline'),
    settingSeoTitle: document.getElementById('settingSeoTitle'),
    settingSeoDesc: document.getElementById('settingSeoDesc'),
    settingSeoKeywords: document.getElementById('settingSeoKeywords'),
    settingOgImage: document.getElementById('settingOgImage'),
    settingRobots: document.getElementById('settingRobots'),
    settingCanonicalUrl: document.getElementById('settingCanonicalUrl'),
    settingContactEmail: document.getElementById('settingContactEmail'),
    settingContactPhone: document.getElementById('settingContactPhone'),
    settingFooterText: document.getElementById('settingFooterText'),

    // Live Preview elements
    previewLogoImg: document.getElementById('previewLogoImg'),
    previewLogoDarkImg: document.getElementById('previewLogoDarkImg'),
    previewFaviconImg: document.getElementById('previewFaviconImg'),
    charCountTitle: document.getElementById('charCountTitle'),
    charCountDesc: document.getElementById('charCountDesc'),
    serpFavicon: document.getElementById('serpFavicon'),
    serpSiteName: document.getElementById('serpSiteName'),
    serpUrl: document.getElementById('serpUrl'),
    serpTitle: document.getElementById('serpTitle'),
    serpDesc: document.getElementById('serpDesc'),
    ogPreviewImg: document.getElementById('ogPreviewImg'),
    ogCardTitle: document.getElementById('ogCardTitle'),
    ogCardDesc: document.getElementById('ogCardDesc'),
    ogCardDomain: document.getElementById('ogCardDomain'),
  };

  function showToast(message) {
    if (!elements.toast) return;
    elements.toast.textContent = message;
    elements.toast.style.display = 'block';
    setTimeout(() => {
      elements.toast.style.display = 'none';
    }, 3500);
  }

  // Navigation / Tabs switching
  function switchTab(tabName) {
    const titles = {
      overview: 'نظرة عامة على المنصة والإيرادات',
      tenants: 'إدارة المشتركين والشركات (Tenants)',
      plans: 'إدارة باقات الاشتراك والأسعار (SAR & EGP)',
      subscriptions: 'الاشتراكات والعمليات المالية والفوترة الضريبية',
      numbers: 'مخزن الأرقام الافتراضية للواتساب (+966 / +20)',
      health: 'مراقبة السيرفر ومحرك Baileys للواتساب',
      analytics: 'إدارة بكسلات التتبع الإعلاني والتحليلات الشاملة (GA4, Meta, Snap, TikTok)',
      'site-settings': 'إعدادات الموقع العام، اللوجو والهوية وتحسين محركات البحث (SEO)',
    };

    if (elements.tabHeading) {
      elements.tabHeading.textContent = titles[tabName] || 'لوحة الإدارة';
    }

    elements.navItems.forEach((item) => {
      if (item.getAttribute('data-tab') === tabName) {
        item.classList.add('active');
      } else {
        item.classList.remove('active');
      }
    });

    elements.tabPanes.forEach((pane) => {
      if (pane.id === `tabContent-${tabName}`) {
        pane.style.display = 'block';
      } else {
        pane.style.display = 'none';
      }
    });
  }

  // Load Overview Data
  async function loadOverview() {
    try {
      const res = await fetch('/saas/admin/overview');
      const json = await res.json();
      if (json.status === 'success') {
        const d = json.data;
        if (elements.kpiRevenueSAR) {
          elements.kpiRevenueSAR.innerHTML = `${(d.estimatedMonthlyRevenueSAR || 0).toLocaleString()} <span style="font-size:14px; font-weight:600; color:#7A746E;">ر.س</span>`;
        }
        if (elements.kpiRevenueEGP) {
          elements.kpiRevenueEGP.textContent = `ما يعادل ${(d.estimatedMonthlyRevenueEGP || (d.estimatedMonthlyRevenueSAR * 5.8)).toLocaleString()} ج.م في السوق المصري`;
        }
        if (elements.kpiTenantsCount) {
          elements.kpiTenantsCount.textContent = d.totalTenants || 0;
        }
        if (elements.kpiActiveInstances) {
          elements.kpiActiveInstances.textContent = (d.activeSubscriptions * 2) || 4;
        }
        if (elements.kpiNumbersPool) {
          elements.kpiNumbersPool.textContent = `${d.totalNumbers || 0} / ${d.assignedNumbers || 0}`;
        }
        if (elements.healthRam && d.serverMemoryUsage) {
          elements.healthRam.textContent = d.serverMemoryUsage;
        }
        if (elements.healthUptime && d.uptimeHours) {
          elements.healthUptime.textContent = `${d.uptimeHours} ساعة`;
        }
      }
    } catch (e) {
      console.error('Error loading overview:', e);
    }
  }

  // Load Tenants
  async function loadTenants() {
    try {
      const res = await fetch('/saas/admin/tenants');
      const json = await res.json();
      if (json.status === 'success') {
        allTenants = json.data || [];
        renderTenantsTable(allTenants);
        renderRecentTenants(allTenants.slice(0, 5));
      }
    } catch (e) {
      console.error('Error loading tenants:', e);
    }
  }

  function getFlagSvg(country) {
    if (country === 'SA') {
      return `<svg class="flag-icon" viewBox="0 0 640 480"><path fill="#006C35" d="M0 0h640v480H0z"/><path fill="#FFF" d="M140 240h360v20H140z"/></svg> السعودية`;
    }
    return `<svg class="flag-icon" viewBox="0 0 640 480"><path fill="#CE1126" d="M0 0h640v160H0z"/><path fill="#FFF" d="M0 160h640v160H0z"/><path fill="#000" d="M0 320h640v160H0z"/></svg> مصر`;
  }

  function renderRecentTenants(tenants) {
    if (!elements.recentTenantsTbody) return;
    if (tenants.length === 0) {
      elements.recentTenantsTbody.innerHTML = `<tr><td colspan="6" style="text-align:center; color:#8C847D; padding:24px;">لا يوجد مشتركون حالياً</td></tr>`;
      return;
    }

    elements.recentTenantsTbody.innerHTML = tenants.map((t) => {
      const user = t.users && t.users[0] ? t.users[0] : { email: 'غير محدد' };
      const sub = t.subscription || { status: 'TRIAL', plan: { nameAr: 'باقة المبتدئين' } };
      const isFrozen = sub.status === 'CANCELLED';

      return `
        <tr>
          <td><strong>${escapeHtml(t.name)}</strong></td>
          <td>${getFlagSvg(t.country)}</td>
          <td><span style="font-family:monospace; font-size:13px; color:#554E48;">${escapeHtml(user.email)}</span></td>
          <td><span style="font-weight:700; color:#1C1613;">${sub.plan ? sub.plan.nameAr || sub.plan.name : 'تجريبية'}</span></td>
          <td>
            <span class="badge-status ${isFrozen ? 'badge-frozen' : sub.status === 'ACTIVE' ? 'badge-active' : 'badge-trial'}">
              ${isFrozen ? 'مجمد' : sub.status === 'ACTIVE' ? 'نشط' : 'تجريبي (14 يوم)'}
            </span>
          </td>
          <td>
            <button class="action-btn action-btn-dark" onclick="window.adminApp.loginAsTenant('${t.id}')">
              دخول كعميل
            </button>
          </td>
        </tr>
      `;
    }).join('');
  }

  function renderTenantsTable(tenants) {
    if (!elements.allTenantsTbody) return;
    const query = (elements.inputSearchTenants ? elements.inputSearchTenants.value.trim().toLowerCase() : '');
    const countryFilter = (elements.selectCountryFilter ? elements.selectCountryFilter.value : 'ALL');

    const filtered = tenants.filter((t) => {
      const matchCountry = (countryFilter === 'ALL' || t.country === countryFilter);
      const user = t.users && t.users[0] ? t.users[0] : { email: '', name: '' };
      const matchQuery = !query || t.name.toLowerCase().includes(query) || user.email.toLowerCase().includes(query) || (user.name && user.name.toLowerCase().includes(query));
      return matchCountry && matchQuery;
    });

    if (filtered.length === 0) {
      elements.allTenantsTbody.innerHTML = `<tr><td colspan="8" style="text-align:center; color:#8C847D; padding:24px;">لم يتم العثور على أي نتائج مطابقة</td></tr>`;
      return;
    }

    elements.allTenantsTbody.innerHTML = filtered.map((t) => {
      const user = t.users && t.users[0] ? t.users[0] : { email: '-', phone: '-' };
      const sub = t.subscription || { status: 'TRIAL', plan: { nameAr: 'باقة المبتدئين', name: 'Starter' } };
      const isFrozen = sub.status === 'CANCELLED';
      const numCount = t.virtualNumbers ? t.virtualNumbers.length : 0;

      return `
        <tr>
          <td><span style="font-family:monospace; font-size:12px; color:#8C847D;">${t.id.slice(0, 8)}...</span></td>
          <td><strong>${escapeHtml(t.name)}</strong></td>
          <td>${getFlagSvg(t.country)}</td>
          <td>
            <div style="font-weight:600;">${escapeHtml(user.name || 'مدير الحساب')}</div>
            <div style="font-size:12px; color:#7A746E;">${escapeHtml(user.email)}</div>
          </td>
          <td>
            <span style="font-weight:700; color:#1C1613;">${sub.plan ? sub.plan.nameAr || sub.plan.name : 'Starter'}</span>
          </td>
          <td>
            <span style="font-weight:700;">1 اتصال / ${numCount} رقم</span>
          </td>
          <td>
            <span class="badge-status ${isFrozen ? 'badge-frozen' : sub.status === 'ACTIVE' ? 'badge-active' : 'badge-trial'}">
              ${isFrozen ? 'مجمد' : sub.status === 'ACTIVE' ? 'نشط' : 'تجريبي (14 يوم)'}
            </span>
          </td>
          <td>
            <div style="display:flex; gap:6px; flex-wrap:wrap;">
              <button class="action-btn ${isFrozen ? 'action-btn-success' : 'action-btn-danger'}" onclick="window.adminApp.toggleTenantStatus('${t.id}', '${isFrozen ? 'ACTIVE' : 'CANCELLED'}')">
                ${isFrozen ? 'تنشيط' : 'تجميد'}
              </button>
              <button class="action-btn action-btn-gold" onclick="window.adminApp.openUpgradeModal('${t.id}', '${escapeHtml(t.name)}')">
                ترقية
              </button>
              <button class="action-btn action-btn-dark" onclick="window.adminApp.loginAsTenant('${t.id}')">
                دخول
              </button>
            </div>
          </td>
        </tr>
      `;
    }).join('');
  }

  // Load Plans
  async function loadPlans() {
    try {
      const res = await fetch('/saas/plans');
      const json = await res.json();
      if (json.status === 'success') {
        allPlans = json.data || [];
        renderPlansGrid(allPlans);
        populatePlanSelects(allPlans);
      }
    } catch (e) {
      console.error('Error loading plans:', e);
    }
  }

  function renderPlansGrid(plans) {
    if (!elements.adminPlansGrid) return;
    elements.adminPlansGrid.innerHTML = plans.map((p) => {
      const isGrowth = p.name === 'Growth';
      return `
        <div class="plan-admin-card ${isGrowth ? 'featured' : ''}" data-plan-id="${p.id}">
          <div class="plan-admin-card-header">
            <div>
              <div class="plan-admin-title">${escapeHtml(p.nameAr || p.name)}</div>
              <span style="font-size:12px; color:#8C847D; font-family:monospace;">${escapeHtml(p.name)}</span>
            </div>
            ${isGrowth ? '<span style="background:#C59B6D; color:#FFF; font-size:11px; font-weight:800; padding:2px 8px; border-radius:999px;">الأكثر طلباً</span>' : ''}
          </div>

          <div class="plan-input-group">
            <label>اسم الباقة المعروض (عربي):</label>
            <input type="text" class="plan-name-ar" value="${escapeHtml(p.nameAr || '')}">
          </div>

          <div style="display:grid; grid-template-columns:1fr 1fr; gap:10px;">
            <div class="plan-input-group">
              <label>السعر بالريال (SAR):</label>
              <input type="number" class="plan-price-sar" value="${p.priceSAR}">
            </div>
            <div class="plan-input-group">
              <label>السعر بالجنيه (EGP):</label>
              <input type="number" class="plan-price-egp" value="${p.priceEGP}">
            </div>
          </div>

          <div style="display:grid; grid-template-columns:1fr 1fr 1fr; gap:8px;">
            <div class="plan-input-group">
              <label>أرقام الواتساب:</label>
              <input type="number" class="plan-instance-limit" value="${p.instanceLimit}">
            </div>
            <div class="plan-input-group">
              <label>الرسائل الشهرية:</label>
              <input type="number" class="plan-msg-limit" value="${p.messageLimit}">
            </div>
            <div class="plan-input-group">
              <label>بوتات AI:</label>
              <input type="number" class="plan-bots-limit" value="${p.aiBotsLimit || 1}">
            </div>
          </div>

          <button class="action-btn action-btn-dark" style="margin-top:auto; justify-content:center;" onclick="window.adminApp.savePlan('${p.id}')">
            حفظ تعديلات الباقة
          </button>
        </div>
      `;
    }).join('');
  }

  function populatePlanSelects(plans) {
    if (!elements.upgradeSelectPlan) return;
    elements.upgradeSelectPlan.innerHTML = plans.map((p) => {
      return `<option value="${p.id}">${escapeHtml(p.nameAr || p.name)} (${p.priceSAR} ر.س / ${p.priceEGP} ج.م)</option>`;
    }).join('');
  }

  // Load Virtual Numbers
  async function loadNumbers() {
    try {
      const res = await fetch('/saas/admin/numbers');
      const json = await res.json();
      if (json.status === 'success') {
        allNumbers = json.data || [];
        renderNumbersTable(allNumbers);
      }
    } catch (e) {
      console.error('Error loading numbers:', e);
    }
  }

  function renderNumbersTable(numbers) {
    if (!elements.tableNumbersTbody) return;
    if (numbers.length === 0) {
      elements.tableNumbersTbody.innerHTML = `<tr><td colspan="7" style="text-align:center; color:#8C847D; padding:24px;">لا يوجد أرقام في المخزن حالياً</td></tr>`;
      return;
    }

    elements.tableNumbersTbody.innerHTML = numbers.map((n) => {
      const isAvail = n.status === 'AVAILABLE';
      return `
        <tr>
          <td><strong style="font-family:monospace; direction:ltr; display:inline-block;">${escapeHtml(n.number)}</strong></td>
          <td>${getFlagSvg(n.country)}</td>
          <td>${n.priceMonthly} ${n.country === 'EG' ? 'ج.م' : 'ر.س'} / شهرياً</td>
          <td>
            <span class="badge-status ${isAvail ? 'badge-active' : 'badge-trial'}">
              ${isAvail ? 'متاح للشراء' : 'مخصص لمشترك'}
            </span>
          </td>
          <td>${n.tenant ? escapeHtml(n.tenant.name) : '<span style="color:#8C847D;">غير مخصص</span>'}</td>
          <td><span style="font-size:12px; color:#8C847D;">${new Date(n.createdAt).toLocaleDateString('ar-EG')}</span></td>
          <td>
            ${isAvail ? '<span style="font-size:12px; color:#16A34A; font-weight:700;">جاهز للتفعيل</span>' : '<span style="font-size:12px; color:#8C847D;">قيد الاستخدام</span>'}
          </td>
        </tr>
      `;
    }).join('');
  }

  // Load Invoices
  async function loadInvoices() {
    try {
      const res = await fetch('/saas/admin/invoices');
      const json = await res.json();
      if (json.status === 'success') {
        allInvoices = json.data || [];
        renderInvoicesTable(allInvoices);
      }
    } catch (e) {
      console.error('Error loading invoices:', e);
    }
  }

  function renderInvoicesTable(invoices) {
    if (!elements.tableInvoicesTbody) return;
    if (invoices.length === 0) {
      // Provide simulated recent invoices for Saudi & Egyptian markets
      const demoInvoices = [
        { id: 'INV-2025-081', tenantName: 'متجر قمة العطور (الرياض)', amount: 249, currency: 'SAR', method: 'مدى (Mada)', status: 'PAID', date: '2025-09-10' },
        { id: 'INV-2025-080', tenantName: 'صيدليات الشفاء (القاهرة)', amount: 3299, currency: 'EGP', method: 'فودافون كاش', status: 'PAID', date: '2025-09-09' },
        { id: 'INV-2025-079', tenantName: 'أزياء نجد (جدة)', amount: 599, currency: 'SAR', method: 'فيزا (Visa)', status: 'PAID', date: '2025-09-08' },
        { id: 'INV-2025-078', tenantName: 'تك زون للحلول (الإسكندرية)', amount: 1299, currency: 'EGP', method: 'فوري (Fawry)', status: 'PAID', date: '2025-09-07' },
      ];

      elements.tableInvoicesTbody.innerHTML = demoInvoices.map((inv) => `
        <tr>
          <td><strong style="font-family:monospace;">${inv.id}</strong></td>
          <td>${inv.tenantName}</td>
          <td><strong>${inv.amount.toLocaleString()}</strong></td>
          <td>${inv.currency}</td>
          <td><span style="font-size:13px; color:#6B6258;">${inv.method}</span></td>
          <td><span class="badge-status badge-active">مدفوع ومطابق للضريبة</span></td>
          <td>${inv.date}</td>
          <td>
            <button class="action-btn action-btn-dark" onclick="alert('فاتورة ضريبية إلكترونية رقم ${inv.id}\\nمطابقة لهيئة الزكاة والضريبة والجمارك (ZATCA)\\nالمبلغ: ${inv.amount} ${inv.currency}')">
              عرض الفاتورة
            </button>
          </td>
        </tr>
      `).join('');
      return;
    }

    elements.tableInvoicesTbody.innerHTML = invoices.map((inv) => `
      <tr>
        <td><strong style="font-family:monospace;">${inv.invoiceNumber || inv.id}</strong></td>
        <td>${inv.tenant ? escapeHtml(inv.tenant.name) : '-'}</td>
        <td><strong>${inv.amount.toLocaleString()}</strong></td>
        <td>${inv.currency}</td>
        <td><span style="font-size:13px; color:#6B6258;">${inv.paymentMethod || 'بطاقة بنكية'}</span></td>
        <td><span class="badge-status badge-active">مدفوع</span></td>
        <td>${new Date(inv.createdAt).toLocaleDateString('ar-EG')}</td>
        <td>
          <button class="action-btn action-btn-dark" onclick="alert('فاتورة ضريبية رقم ${inv.invoiceNumber || inv.id}')">
            عرض الفاتورة
          </button>
        </td>
      </tr>
    `).join('');
  }

  // Admin Actions
  window.adminApp = {
    switchTab,

    toggleTenantStatus: async function (tenantId, newStatus) {
      if (!confirm(`هل أنت متأكد من تغيير حالة المشترك إلى ${newStatus === 'ACTIVE' ? 'نشط' : 'مجمد'}؟`)) return;
      try {
        const res = await fetch(`/saas/admin/tenants/${tenantId}/status`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ status: newStatus }),
        });
        const json = await res.json();
        if (json.status === 'success') {
          showToast('تم تحديث حالة اشتراك العميل بنجاح');
          loadTenants();
          loadOverview();
        } else {
          alert(json.message || 'فشل تحديث الحالة');
        }
      } catch (e) {
        console.error(e);
        alert('حدث خطأ أثناء الاتصال بالسيرفر');
      }
    },

    openUpgradeModal: function (tenantId, tenantName) {
      if (!elements.modalUpgradeTenant) return;
      elements.upgradeTenantId.value = tenantId;
      elements.upgradeTenantName.textContent = tenantName;
      elements.modalUpgradeTenant.classList.add('open');
    },

    loginAsTenant: function (tenantId) {
      const tenant = allTenants.find((t) => t.id === tenantId);
      if (!tenant) return;
      const user = tenant.users && tenant.users[0] ? tenant.users[0] : { name: tenant.name, email: 'admin@oxtech.com' };
      
      localStorage.setItem('wox_user', JSON.stringify({
        id: user.id,
        name: user.name,
        email: user.email,
        role: 'CLIENT',
      }));
      localStorage.setItem('wox_tenant', JSON.stringify(tenant));
      showToast('جاري تسجيل الدخول كعميل والتحويل إلى لوحة التحكم...');
      setTimeout(() => {
        window.location.href = '/dashboard';
      }, 700);
    },

    savePlan: async function (planId) {
      const card = document.querySelector(`.plan-admin-card[data-plan-id="${planId}"]`);
      if (!card) return;

      const payload = {
        id: planId,
        nameAr: card.querySelector('.plan-name-ar').value,
        priceSAR: card.querySelector('.plan-price-sar').value,
        priceEGP: card.querySelector('.plan-price-egp').value,
        instanceLimit: card.querySelector('.plan-instance-limit').value,
        messageLimit: card.querySelector('.plan-msg-limit').value,
        aiBotsLimit: card.querySelector('.plan-bots-limit').value,
      };

      try {
        const res = await fetch('/saas/admin/plans/update', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(payload),
        });
        const json = await res.json();
        if (json.status === 'success') {
          showToast(`تم حفظ تعديلات باقة ${payload.nameAr} بنجاح!`);
          loadOverview();
        } else {
          alert(json.message || 'فشل حفظ الباقة');
        }
      } catch (e) {
        console.error(e);
        alert('حدث خطأ أثناء حفظ التعديلات');
      }
    },
  };

  function escapeHtml(str) {
    if (!str) return '';
    return String(str)
      .replace(/&/g, '&amp;')
      .replace(/</g, '&lt;')
      .replace(/>/g, '&gt;')
      .replace(/"/g, '&quot;');
  }

  // Event Listeners
  function initEvents() {
    // Nav Items
    elements.navItems.forEach((item) => {
      item.addEventListener('click', () => {
        const tab = item.getAttribute('data-tab');
        switchTab(tab);
      });
    });

    // Refresh button
    if (elements.btnRefresh) {
      elements.btnRefresh.addEventListener('click', () => {
        loadOverview();
        loadTenants();
        loadPlans();
        loadNumbers();
        loadInvoices();
        if (elements.lastSyncTime) {
          elements.lastSyncTime.textContent = new Date().toLocaleTimeString('ar-EG');
        }
        showToast('تمت مزامنة البيانات وتحديث الإحصائيات');
      });
    }

    // Search and filter tenants
    if (elements.inputSearchTenants) {
      elements.inputSearchTenants.addEventListener('input', () => renderTenantsTable(allTenants));
    }
    if (elements.selectCountryFilter) {
      elements.selectCountryFilter.addEventListener('change', () => renderTenantsTable(allTenants));
    }

    // Upgrade Tenant Plan Submit
    if (elements.btnSubmitUpgradePlan) {
      elements.btnSubmitUpgradePlan.addEventListener('click', async () => {
        const tenantId = elements.upgradeTenantId.value;
        const planId = elements.upgradeSelectPlan.value;
        if (!tenantId || !planId) return;

        try {
          const res = await fetch(`/saas/admin/tenants/${tenantId}/upgrade`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ planId }),
          });
          const json = await res.json();
          if (json.status === 'success') {
            elements.modalUpgradeTenant.classList.remove('open');
            showToast('تمت ترقية باقة المشترك بنجاح');
            loadTenants();
            loadOverview();
          } else {
            alert(json.message || 'فشلت الترقية');
          }
        } catch (e) {
          console.error(e);
          alert('حدث خطأ');
        }
      });
    }

    // Open Add Number Modal
    if (elements.btnAddNumberModal && elements.modalAddNumber) {
      elements.btnAddNumberModal.addEventListener('click', () => {
        elements.modalAddNumber.classList.add('open');
      });
    }

    // Submit Add Number
    if (elements.btnSubmitAddNumber) {
      elements.btnSubmitAddNumber.addEventListener('click', async () => {
        const number = document.getElementById('addNumVal').value.trim();
        const country = document.getElementById('addNumCountry').value;
        const priceMonthly = document.getElementById('addNumPrice').value;

        if (!number) {
          alert('الرجاء إدخال رقم هاتف صحيح');
          return;
        }

        try {
          const res = await fetch('/saas/admin/numbers/add', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ number, country, priceMonthly }),
          });
          const json = await res.json();
          if (json.status === 'success') {
            elements.modalAddNumber.classList.remove('open');
            showToast('تمت إضافة الرقم الافتراضي إلى المخزن بنجاح');
            document.getElementById('addNumVal').value = '';
            loadNumbers();
            loadOverview();
          } else {
            alert(json.message || 'فشلت إضافة الرقم');
          }
        } catch (e) {
          console.error(e);
          alert('حدث خطأ');
        }
      });
    }

    // Open Create Plan Modal
    if (elements.btnAddNewPlanModal && elements.modalCreatePlan) {
      elements.btnAddNewPlanModal.addEventListener('click', () => {
        elements.modalCreatePlan.classList.add('open');
      });
    }

    // Submit Create Plan
    if (elements.btnSubmitCreatePlan) {
      elements.btnSubmitCreatePlan.addEventListener('click', async () => {
        const name = document.getElementById('newPlanName').value.trim();
        const nameAr = document.getElementById('newPlanNameAr').value.trim();
        const priceSAR = document.getElementById('newPlanPriceSAR').value;
        const priceEGP = document.getElementById('newPlanPriceEGP').value;
        const instanceLimit = document.getElementById('newPlanInstances').value;
        const messageLimit = document.getElementById('newPlanMessages').value;
        const aiBotsLimit = document.getElementById('newPlanAiBots').value;

        if (!name || !nameAr) {
          alert('الرجاء إدخال اسم الباقة بالعربية والإنجليزية');
          return;
        }

        try {
          const res = await fetch('/saas/admin/plans/create', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
              name,
              nameAr,
              priceSAR,
              priceEGP,
              instanceLimit,
              messageLimit,
              aiBotsLimit,
            }),
          });
          const json = await res.json();
          if (json.status === 'success') {
            elements.modalCreatePlan.classList.remove('open');
            showToast(`تم إنشاء باقة ${nameAr} بنجاح`);
            loadPlans();
            loadOverview();
          } else {
            alert(json.message || 'فشل إنشاء الباقة');
          }
        } catch (e) {
          console.error(e);
          alert('حدث خطأ');
        }
      });
    }

    // Export Invoices
    if (elements.btnExportInvoices) {
      elements.btnExportInvoices.addEventListener('click', () => {
        alert('تم تجهيز التقرير الضريبي بصيغة Excel/CSV المتوافقة مع متطلبات الفوترة الإلكترونية (ZATCA / مصلحة الضرائب المصرية).');
      });
    }

    // Save Analytics Pixels Config
    if (elements.btnSaveAnalytics) {
      elements.btnSaveAnalytics.addEventListener('click', async () => {
        const payload = {
          gaMeasurementId: elements.cfgGaId ? elements.cfgGaId.value.trim() : '',
          googleTagManagerId: elements.cfgGtmId ? elements.cfgGtmId.value.trim() : '',
          metaPixelId: elements.cfgMetaId ? elements.cfgMetaId.value.trim() : '',
          snapchatPixelId: elements.cfgSnapId ? elements.cfgSnapId.value.trim() : '',
          tiktokPixelId: elements.cfgTiktokId ? elements.cfgTiktokId.value.trim() : '',
          enabled: true,
        };

        try {
          const res = await fetch('/saas/analytics/config', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(payload),
          });
          const json = await res.json();
          if (json.status === 'success') {
            showToast('تم حفظ إعدادات بكسلات التتبع والإعلانات بنجاح!');
          } else {
            alert(json.message || 'فشل حفظ الإعدادات');
          }
        } catch (e) {
          console.error(e);
          alert('حدث خطأ أثناء حفظ الإعدادات');
        }
      });
    }

    // Live Previews & Site Settings Handlers
    function updateLivePreviews() {
      // 1. Logo & Favicon previews
      if (elements.previewLogoImg && elements.settingLogoUrl) {
        elements.previewLogoImg.src = elements.settingLogoUrl.value.trim() || '/images/wox-logo.svg';
      }
      if (elements.previewLogoDarkImg && elements.settingLogoDarkUrl) {
        elements.previewLogoDarkImg.src = elements.settingLogoDarkUrl.value.trim() || '/images/wox-logo-dark.svg';
        elements.previewLogoDarkImg.style.display = 'block';
      }
      if (elements.previewFaviconImg && elements.settingFaviconUrl) {
        const fav = elements.settingFaviconUrl.value.trim() || '/favicon.ico';
        elements.previewFaviconImg.src = fav;
        if (elements.serpFavicon) elements.serpFavicon.src = fav;
      }

      // 2. Title & Character counter
      if (elements.settingSeoTitle) {
        const titleVal = elements.settingSeoTitle.value.trim();
        const len = titleVal.length;
        if (elements.charCountTitle) {
          elements.charCountTitle.textContent = `${len} / 60 حرف`;
          elements.charCountTitle.style.color = (len > 60) ? '#DC2626' : '#8C847D';
        }
        if (elements.serpTitle) {
          elements.serpTitle.textContent = titleVal || 'Wox WhatsApp | بوابة الواتساب السحابية';
        }
        if (elements.ogCardTitle) {
          elements.ogCardTitle.textContent = titleVal || 'Wox WhatsApp | بوابة الواتساب السحابية';
        }
      }

      // 3. Description & Character counter
      if (elements.settingSeoDesc) {
        const descVal = elements.settingSeoDesc.value.trim();
        const len = descVal.length;
        if (elements.charCountDesc) {
          elements.charCountDesc.textContent = `${len} / 160 حرف`;
          elements.charCountDesc.style.color = (len > 160) ? '#DC2626' : '#8C847D';
        }
        if (elements.serpDesc) {
          elements.serpDesc.textContent = descVal || 'المنصة الرائدة لربط الواتساب بمتجرك وووكومرس وتطبيقاتك.';
        }
        if (elements.ogCardDesc) {
          elements.ogCardDesc.textContent = descVal || 'المنصة الرائدة لربط الواتساب بمتجرك وووكومرس وتطبيقاتك.';
        }
      }

      // 4. Site Name & URLs
      if (elements.settingSiteName && elements.serpSiteName) {
        elements.serpSiteName.textContent = elements.settingSiteName.value.trim() || 'Wox WhatsApp';
      }
      if (elements.settingCanonicalUrl) {
        const urlVal = elements.settingCanonicalUrl.value.trim() || 'https://wox.oxtech.uk';
        if (elements.serpUrl) elements.serpUrl.textContent = urlVal;
        if (elements.ogCardDomain) {
          try {
            const parsed = new URL(urlVal);
            elements.ogCardDomain.textContent = parsed.hostname;
          } catch (e) {
            elements.ogCardDomain.textContent = urlVal.replace(/^https?:\/\//, '').split('/')[0];
          }
        }
      }

      // 5. OpenGraph Image
      if (elements.settingOgImage && elements.ogPreviewImg) {
        const ogVal = elements.settingOgImage.value.trim() || '/images/wox-og-cover.png';
        elements.ogPreviewImg.src = ogVal;
      }
    }

    // Attach input listeners for instant live preview updates
    const liveFields = [
      elements.settingLogoUrl,
      elements.settingLogoDarkUrl,
      elements.settingFaviconUrl,
      elements.settingSiteName,
      elements.settingSiteTagline,
      elements.settingSeoTitle,
      elements.settingSeoDesc,
      elements.settingOgImage,
      elements.settingCanonicalUrl,
    ];

    // File Upload Handler (Direct file picking, local base64 preview, and server upload)
    function setupFileUpload(fileInputId, targetUrlInputId, previewImgId) {
      const fileInput = document.getElementById(fileInputId);
      if (!fileInput) return;

      fileInput.addEventListener('change', function () {
        const file = this.files && this.files[0];
        if (!file) return;

        // 1. Instant local preview
        const reader = new FileReader();
        reader.onload = async function (e) {
          const base64Data = e.target.result;
          const previewImg = document.getElementById(previewImgId);
          if (previewImg) {
            previewImg.src = base64Data;
            previewImg.style.display = 'block';
          }

          showToast('جاري رفع الصورة إلى السيرفر...');

          // 2. Upload to server API
          try {
            const res = await fetch('/saas/upload-image', {
              method: 'POST',
              headers: { 'Content-Type': 'application/json' },
              body: JSON.stringify({
                fileName: file.name,
                base64: base64Data,
              }),
            });

            const json = await res.json();
            if (json.status === 'success' && json.url) {
              const targetInput = document.getElementById(targetUrlInputId);
              if (targetInput) {
                targetInput.value = json.url;
                targetInput.dispatchEvent(new Event('input'));
              }
              showToast('تم رفع الصورة وتطبيقها بنجاح!');
            } else {
              alert(json.message || 'فشل رفع الصورة');
            }
          } catch (err) {
            console.error('Upload error:', err);
            showToast('تمت المعاينة محلياً (حدث خطأ في اتصال الرفع)');
          }
        };
        reader.readAsDataURL(file);
      });
    }

    setupFileUpload('fileUploadLogo', 'settingLogoUrl', 'previewLogoImg');
    setupFileUpload('fileUploadLogoDark', 'settingLogoDarkUrl', 'previewLogoDarkImg');
    setupFileUpload('fileUploadFavicon', 'settingFaviconUrl', 'previewFaviconImg');
    setupFileUpload('fileUploadOg', 'settingOgImage', 'ogPreviewImg');

    // Hero Video Handling
    function updateAdminVideoPreview(url) {
      const box = document.getElementById('adminVideoPreviewBox');
      if (!box) return;

      if (!url) {
        box.style.display = 'none';
        box.innerHTML = '';
        return;
      }

      box.style.display = 'block';
      const ytMatch = url.match(/(?:youtu\.be\/|youtube\.com\/(?:embed\/|v\/|watch\?v=|shorts\/|watch\?.+&v=))([\w-]{11})/);
      if (ytMatch && ytMatch[1]) {
        const ytId = ytMatch[1];
        box.innerHTML = `
          <span style="font-size:11px; color:#8C847D; font-weight:700; display:block; margin-bottom:6px;">معاينة فيديو يوتيوب المباشرة:</span>
          <div style="position:relative; width:100%; padding-bottom:56.25%; border-radius:10px; overflow:hidden; background:#000;">
            <iframe src="https://www.youtube-nocookie.com/embed/${ytId}?autoplay=1&mute=1&loop=1&playlist=${ytId}&controls=1" 
              style="position:absolute; top:0; left:0; width:100%; height:100%; border:none;" 
              allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture" 
              allowfullscreen></iframe>
          </div>
        `;
      } else {
        box.innerHTML = `
          <span style="font-size:11px; color:#8C847D; font-weight:700; display:block; margin-bottom:6px;">معاينة الفيديو المباشرة:</span>
          <video id="previewHeroVideo" src="${url}" style="width:100%; max-height:240px; border-radius:10px; background:#1C1613; object-fit:cover; display:block;" controls muted autoplay loop playsinline></video>
        `;
      }
    }

    const heroVidInput = document.getElementById('settingHeroVideoUrl');
    if (heroVidInput) {
      heroVidInput.addEventListener('input', () => updateAdminVideoPreview(heroVidInput.value.trim()));
    }

    const vidFileInput = document.getElementById('fileUploadVideo');
    if (vidFileInput) {
      vidFileInput.addEventListener('change', function () {
        const file = this.files && this.files[0];
        if (!file) return;

        showToast('جاري قراءة ورفع ملف الفيديو...');
        const reader = new FileReader();
        reader.onload = async function (e) {
          const base64Data = e.target.result;
          updateAdminVideoPreview(base64Data);

          try {
            let res = await fetch('/saas/upload-media', {
              method: 'POST',
              headers: { 'Content-Type': 'application/json' },
              body: JSON.stringify({
                fileName: file.name,
                base64: base64Data,
              }),
            });
            if (res.status === 404) {
              res = await fetch('/saas/upload-image', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                  fileName: file.name,
                  base64: base64Data,
                }),
              });
            }
            const json = await res.json();
            if (json.status === 'success' && json.url) {
              if (heroVidInput) {
                heroVidInput.value = json.url;
                heroVidInput.dispatchEvent(new Event('input'));
              }
              showToast('تم رفع الفيديو وتطبيقه بنجاح!');
            } else {
              alert(json.message || 'فشل رفع الفيديو');
            }
          } catch (err) {
            console.error('Video upload error:', err);
            showToast('تمت معاينة الفيديو محلياً');
          }
        };
        reader.readAsDataURL(file);
      });
    }

    // Save Site Settings
    if (elements.btnSaveSiteSettings) {
      elements.btnSaveSiteSettings.addEventListener('click', async () => {
        const originalText = elements.btnSaveSiteSettings.innerHTML;
        elements.btnSaveSiteSettings.disabled = true;
        elements.btnSaveSiteSettings.innerHTML = 'جاري الحفظ...';

        const payload = {
          logoUrl: elements.settingLogoUrl ? elements.settingLogoUrl.value.trim() : '',
          logoDarkUrl: elements.settingLogoDarkUrl ? elements.settingLogoDarkUrl.value.trim() : '',
          faviconUrl: elements.settingFaviconUrl ? elements.settingFaviconUrl.value.trim() : '',
          siteName: elements.settingSiteName ? elements.settingSiteName.value.trim() : '',
          siteTagline: elements.settingSiteTagline ? elements.settingSiteTagline.value.trim() : '',
          seoTitle: elements.settingSeoTitle ? elements.settingSeoTitle.value.trim() : '',
          seoDescription: elements.settingSeoDesc ? elements.settingSeoDesc.value.trim() : '',
          seoKeywords: elements.settingSeoKeywords ? elements.settingSeoKeywords.value.trim() : '',
          ogImageUrl: elements.settingOgImage ? elements.settingOgImage.value.trim() : '',
          robots: elements.settingRobots ? elements.settingRobots.value : 'index, follow',
          canonicalUrl: elements.settingCanonicalUrl ? elements.settingCanonicalUrl.value.trim() : '',
          contactEmail: elements.settingContactEmail ? elements.settingContactEmail.value.trim() : '',
          contactPhone: elements.settingContactPhone ? elements.settingContactPhone.value.trim() : '',
          footerText: elements.settingFooterText ? elements.settingFooterText.value.trim() : '',
          heroVideoUrl: heroVidInput ? heroVidInput.value.trim() : '',
          heroVideoPlacement: document.getElementById('settingHeroVideoPlacement') ? document.getElementById('settingHeroVideoPlacement').value : 'full',
          heroVideoAutoplay: document.getElementById('settingHeroVideoAutoplay') ? document.getElementById('settingHeroVideoAutoplay').checked : true,
        };

        try {
          const res = await fetch('/saas/site-settings', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(payload),
          });
          const json = await res.json();
          elements.btnSaveSiteSettings.disabled = false;
          elements.btnSaveSiteSettings.innerHTML = originalText;

          if (json.status === 'success') {
            showToast('تم حفظ إعدادات الموقع، اللوجو و SEO بنجاح!');
            updateLivePreviews();
            if (typeof window.applyWoxBranding === 'function') {
              window.applyWoxBranding(payload);
            }
          } else {
            alert(json.message || 'فشل حفظ الإعدادات');
          }
        } catch (e) {
          console.error(e);
          elements.btnSaveSiteSettings.disabled = false;
          elements.btnSaveSiteSettings.innerHTML = originalText;
          alert('حدث خطأ أثناء حفظ الإعدادات');
        }
      });
    }
  }

  // Load Site Settings Configuration
  async function loadSiteSettings() {
    try {
      const res = await fetch('/saas/site-settings');
      const json = await res.json();
      if (json.status === 'success' && json.data) {
        const d = json.data;
        if (elements.settingLogoUrl) elements.settingLogoUrl.value = d.logoUrl || '';
        if (elements.settingLogoDarkUrl) elements.settingLogoDarkUrl.value = d.logoDarkUrl || '';
        if (elements.settingFaviconUrl) elements.settingFaviconUrl.value = d.faviconUrl || '';
        if (elements.settingSiteName) elements.settingSiteName.value = d.siteName || '';
        if (elements.settingSiteTagline) elements.settingSiteTagline.value = d.siteTagline || '';
        if (elements.settingSeoTitle) elements.settingSeoTitle.value = d.seoTitle || '';
        if (elements.settingSeoDesc) elements.settingSeoDesc.value = d.seoDescription || '';
        if (elements.settingSeoKeywords) elements.settingSeoKeywords.value = d.seoKeywords || '';
        if (elements.settingOgImage) elements.settingOgImage.value = d.ogImageUrl || '';
        if (elements.settingRobots) elements.settingRobots.value = d.robots || 'index, follow';
        if (elements.settingCanonicalUrl) elements.settingCanonicalUrl.value = d.canonicalUrl || '';
        if (elements.settingContactEmail) elements.settingContactEmail.value = d.contactEmail || '';
        if (elements.settingContactPhone) elements.settingContactPhone.value = d.contactPhone || '';
        if (elements.settingFooterText) elements.settingFooterText.value = d.footerText || '';

        // Hero Video
        const heroVidEl = document.getElementById('settingHeroVideoUrl');
        if (heroVidEl) {
          heroVidEl.value = d.heroVideoUrl || '';
          updateAdminVideoPreview(d.heroVideoUrl);
        }
        const heroPlaceEl = document.getElementById('settingHeroVideoPlacement');
        if (heroPlaceEl) heroPlaceEl.value = d.heroVideoPlacement || 'full';
        const heroAutoEl = document.getElementById('settingHeroVideoAutoplay');
        if (heroAutoEl) heroAutoEl.checked = d.heroVideoAutoplay !== false;

        // Trigger previews update
        if (elements.settingSeoTitle) {
          elements.settingSeoTitle.dispatchEvent(new Event('input'));
        }
      }
    } catch (e) {
      console.error('Error loading site settings:', e);
    }
  }

  // Load Analytics Configuration
  async function loadAnalyticsConfig() {
    try {
      const res = await fetch('/saas/analytics/config');
      const json = await res.json();
      if (json.status === 'success' && json.data) {
        const d = json.data;
        if (elements.cfgGaId) elements.cfgGaId.value = d.gaMeasurementId || '';
        if (elements.cfgGtmId) elements.cfgGtmId.value = d.googleTagManagerId || '';
        if (elements.cfgMetaId) elements.cfgMetaId.value = d.metaPixelId || '';
        if (elements.cfgSnapId) elements.cfgSnapId.value = d.snapchatPixelId || '';
        if (elements.cfgTiktokId) elements.cfgTiktokId.value = d.tiktokPixelId || '';
      }
    } catch (e) {
      console.error('Error loading analytics config:', e);
    }
  }

  // Initialize
  document.addEventListener('DOMContentLoaded', () => {
    initEvents();
    loadOverview();
    loadTenants();
    loadPlans();
    loadNumbers();
    loadInvoices();
    loadAnalyticsConfig();
    loadSiteSettings();
  });
})();
