/**
 * 🏢 Wox Super Admin: Tenants & Subscribers Module (Isolated Scope)
 */

(function () {
  'use strict';

  const AdminTenantsModule = {
    tenants: [],

    init: async function () {
      WoxAdminLayout.init('tenants');
      this.render();
      try {
        await this.loadTenants();
      } catch (err) {
        WoxCore.handlePageError('إدارة المشتركين', err);
      }
    },

    render: function () {
      const container = document.getElementById('module-content-container');
      if (!container) return;

      container.innerHTML = `
        <div style="display:flex; justify-content:space-between; align-items:center; margin-bottom:24px;">
          <div>
            <h1 style="font-size:24px; font-weight:800; color:#1C1613; margin-bottom:6px;">إدارة المشتركين والشركات (Tenants)</h1>
            <p style="color:#736B63; font-size:14px;">قائمة بكافة المشتركين والشركات المسجلة على المنصة وإدارة حالات الحسابات.</p>
          </div>
          <button class="action-btn action-btn-gold" style="padding:10px 18px;" onclick="AdminTenantsModule.loadTenants()">
            🔄 تحديث القائمة
          </button>
        </div>

        <div style="background:#FFF; border:1px solid #ECE7DE; border-radius:14px; padding:24px; box-shadow:0 2px 10px rgba(0,0,0,0.02);">
          <div style="overflow-x:auto;">
            <table class="admin-table" style="width:100%; border-collapse:collapse; text-align:right;">
              <thead>
                <tr>
                  <th>اسم الشركة / المشترك</th>
                  <th>الدولة والعملة</th>
                  <th>الباقة الحالية</th>
                  <th>تاريخ التسجيل</th>
                  <th>الحالة</th>
                  <th>التحكم</th>
                </tr>
              </thead>
              <tbody id="tenants-table-body">
                <tr><td colspan="6" style="text-align:center; padding:30px; color:#8C827A;">جاري تحميل المشتركين...</td></tr>
              </tbody>
            </table>
          </div>
        </div>
      `;
    },

    loadTenants: async function () {
      const tbody = document.getElementById('tenants-table-body');
      try {
        const res = await WoxCore.api('/saas/admin/tenants');
        this.tenants = Array.isArray(res.data) ? res.data : [];

        if (this.tenants.length === 0) {
          tbody.innerHTML = '<tr><td colspan="6" style="text-align:center; padding:30px;">لا يوجد مشتركون مسجلون حالياً</td></tr>';
          return;
        }

        tbody.innerHTML = this.tenants.map((t) => {
          const user = t.users && t.users[0] ? t.users[0] : {};
          const plan = t.subscriptions && t.subscriptions[0] && t.subscriptions[0].plan ? t.subscriptions[0].plan.name : 'باقة النمو (Growth)';
          const status = t.status || 'ACTIVE';

          return `
            <tr>
              <td>
                <div style="font-weight:700; color:#1C1613;">${t.name}</div>
                <div style="font-size:12px; color:#8C827A;">${user.email || 'بدون بريد'}</div>
              </td>
              <td>${t.country === 'SA' ? '🇸🇦 السعودية (SAR)' : '🇪🇬 مصر (EGP)'}</td>
              <td><span style="background:#F3EFE8; color:#1C1613; padding:4px 8px; border-radius:6px; font-weight:700; font-size:12px;">${plan}</span></td>
              <td style="color:#736B63; font-size:13px;">${t.createdAt ? new Date(t.createdAt).toLocaleDateString('ar-SA') : '2026-09-15'}</td>
              <td>
                <span class="badge-status ${status === 'ACTIVE' ? 'badge-active' : 'badge-frozen'}">
                  ${status === 'ACTIVE' ? 'نشط' : 'مجمد'}
                </span>
              </td>
              <td>
                <button class="action-btn action-btn-dark" style="font-size:11px;" onclick="WoxCore.showToast('تم فتح تفاصيل حساب ${t.name}')">عرض</button>
              </td>
            </tr>
          `;
        }).join('');
      } catch (err) {
        tbody.innerHTML = `<tr><td colspan="6" style="text-align:center; padding:30px; color:#DC2626;">تعذر تحميل المشتركين</td></tr>`;
      }
    },
  };

  window.AdminTenantsModule = AdminTenantsModule;
  document.addEventListener('DOMContentLoaded', () => AdminTenantsModule.init());
})();
