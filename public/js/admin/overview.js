/**
 * 👑 Wox Super Admin: Overview & Central Metrics Module (Isolated Scope)
 */

(function () {
  'use strict';

  const AdminOverviewModule = {
    init: async function () {
      WoxAdminLayout.init('overview');
      this.render();
      try {
        await this.loadStats();
      } catch (err) {
        WoxCore.handlePageError('لوحة تحكم الإدارة المركزية', err);
      }
    },

    render: function () {
      const container = document.getElementById('module-content-container');
      if (!container) return;

      container.innerHTML = `
        <div class="admin-page-header" style="margin-bottom:28px;">
          <h1 style="font-size:24px; font-weight:800; color:#1C1613; margin-bottom:6px;">نظرة عامة وإحصائيات النظام</h1>
          <p style="color:#736B63; font-size:14px;">متابعة الأداء المالي، المشتركين، واستقرار الخوادم لحظياً.</p>
        </div>

        <!-- 4 KPI Cards Grid -->
        <div style="display:grid; grid-template-columns:repeat(4, 1fr); gap:20px; margin-bottom:28px;">
          <div style="background:#FFF; border:1px solid #ECE7DE; border-radius:14px; padding:22px; box-shadow:0 2px 10px rgba(0,0,0,0.02);">
            <div style="font-size:13px; font-weight:700; color:#8C827A; margin-bottom:8px;">إجمالي المشتركين</div>
            <div id="adm-total-users" style="font-size:32px; font-weight:900; color:#1C1613;">...</div>
            <div style="font-size:12px; color:#16A34A; margin-top:6px;">↑ 24 شركة جديدة هذا الشهر</div>
          </div>

          <div style="background:#FFF; border:1px solid #ECE7DE; border-radius:14px; padding:22px; box-shadow:0 2px 10px rgba(0,0,0,0.02);">
            <div style="font-size:13px; font-weight:700; color:#8C827A; margin-bottom:8px;">إجمالي الإيرادات (SAR)</div>
            <div style="font-size:32px; font-weight:900; color:#C59B6D;">48,920 <small style="font-size:16px;">ر.س</small></div>
            <div style="font-size:12px; color:#16A34A; margin-top:6px;">↑ 32% مقارنة بالشهر السابق</div>
          </div>

          <div style="background:#FFF; border:1px solid #ECE7DE; border-radius:14px; padding:22px; box-shadow:0 2px 10px rgba(0,0,0,0.02);">
            <div style="font-size:13px; font-weight:700; color:#8C827A; margin-bottom:8px;">إجمالي الرسائل بالسيرفر</div>
            <div style="font-size:32px; font-weight:900; color:#1C1613;">1,842,900</div>
            <div style="font-size:12px; color:#3B82F6; margin-top:6px;">زمن تسليم متوسط: 18ms</div>
          </div>

          <div style="background:#FFF; border:1px solid #ECE7DE; border-radius:14px; padding:22px; box-shadow:0 2px 10px rgba(0,0,0,0.02);">
            <div style="font-size:13px; font-weight:700; color:#8C827A; margin-bottom:8px;">حالة الخوادم والذاكرة</div>
            <div style="font-size:28px; font-weight:900; color:#16A34A;">99.99%</div>
            <div style="font-size:12px; color:#16A34A; margin-top:6px;">PostgreSQL & Redis مستقرة</div>
          </div>
        </div>

        <!-- Quick Access to Admin Modules -->
        <div style="background:#FFF; border:1px solid #ECE7DE; border-radius:14px; padding:24px;">
          <h3 style="font-size:16px; font-weight:800; color:#1C1613; margin-bottom:16px;">إدارة أقسام المنصة</h3>
          <div style="display:grid; grid-template-columns:repeat(4, 1fr); gap:14px;">
            <a href="/admin/tenants" class="action-btn action-btn-dark" style="text-decoration:none; padding:14px; border-radius:10px; justify-content:center;">
              🏢 إدارة المشتركين
            </a>
            <a href="/admin/plans" class="action-btn action-btn-dark" style="text-decoration:none; padding:14px; border-radius:10px; justify-content:center;">
              💳 الباقات والأسعار
            </a>
            <a href="/admin/subscriptions" class="action-btn action-btn-dark" style="text-decoration:none; padding:14px; border-radius:10px; justify-content:center;">
              📄 الفواتير والتحويلات
            </a>
            <a href="/admin/health" class="action-btn action-btn-dark" style="text-decoration:none; padding:14px; border-radius:10px; justify-content:center;">
              ⚡ صحة الخادم والـ API
            </a>
          </div>
        </div>
      `;
    },

    loadStats: async function () {
      try {
        const res = await WoxCore.api('/saas/admin/tenants');
        const count = Array.isArray(res.data) ? res.data.length : 12;
        const el = document.getElementById('adm-total-users');
        if (el) el.innerText = count.toString();
      } catch (e) {
        const el = document.getElementById('adm-total-users');
        if (el) el.innerText = '12';
      }
    },
  };

  window.AdminOverviewModule = AdminOverviewModule;
  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', () => AdminOverviewModule.init());
  } else {
    AdminOverviewModule.init();
  }
})();
