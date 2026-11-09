/**
 * 💳 Wox Super Admin: Plans & Pricing Module (Isolated Scope)
 */

(function () {
  'use strict';

  const AdminPlansModule = {
    plans: [],

    init: async function () {
      WoxAdminLayout.init('plans');
      this.render();
      try {
        await this.loadPlans();
      } catch (err) {
        WoxCore.handlePageError('إدارة الباقات', err);
      }
    },

    render: function () {
      const container = document.getElementById('module-content-container');
      if (!container) return;

      container.innerHTML = `
        <div style="display:flex; justify-content:space-between; align-items:center; margin-bottom:24px;">
          <div>
            <h1 style="font-size:24px; font-weight:800; color:#1C1613; margin-bottom:6px;">إدارة الباقات والأسعار</h1>
            <p style="color:#736B63; font-size:14px;">تعديل أسعار الباقات بالريال السعودي والجنيه المصري، وتحديد حدود الإرسال والأرقام.</p>
          </div>
        </div>

        <div id="admin-plans-grid" style="display:grid; grid-template-columns:repeat(auto-fit, minmax(300px, 1fr)); gap:24px;">
          <div style="text-align:center; padding:30px; color:#8C827A;">جاري تحميل الباقات...</div>
        </div>
      `;
    },

    loadPlans: async function () {
      const container = document.getElementById('admin-plans-grid');
      try {
        const res = await WoxCore.api('/saas/plans');
        this.plans = Array.isArray(res.data) ? res.data : [];

        if (this.plans.length === 0) {
          container.innerHTML = '<div style="padding:30px; color:#8C827A;">لا توجد باقات معرفة</div>';
          return;
        }

        container.innerHTML = this.plans.map((p) => `
          <div style="background:#FFF; border:1px solid #ECE7DE; border-radius:14px; padding:24px; box-shadow:0 2px 10px rgba(0,0,0,0.02); display:flex; flex-direction:column; justify-content:space-between;">
            <div>
              <div style="display:flex; justify-content:space-between; align-items:center; margin-bottom:14px;">
                <h3 style="font-size:18px; font-weight:800; color:#1C1613; margin:0;">${p.name}</h3>
                <span style="font-size:11px; background:#F3EFE8; color:#8C827A; padding:3px 8px; border-radius:6px; font-weight:700;">${p.code}</span>
              </div>

              <div style="margin-bottom:16px;">
                <div style="font-size:26px; font-weight:900; color:#1C1613;">
                  ${p.priceSAR} <small style="font-size:14px; color:#8C827A;">ر.س / شهر</small>
                </div>
                <div style="font-size:16px; font-weight:700; color:#C59B6D; margin-top:4px;">
                  ${p.priceEGP} <small style="font-size:12px; color:#8C827A;">ج.م / شهر</small>
                </div>
              </div>

              <ul style="list-style:none; padding:0; margin:0 0 20px 0; font-size:13px; color:#615B54; display:flex; flex-direction:column; gap:8px;">
                <li>📱 عدد الأرقام: <strong>${p.maxInstances} أرقام</strong></li>
                <li>📨 عدد الرسائل: <strong>${p.maxMessages.toLocaleString('ar-EG')} رسالة/شهر</strong></li>
                <li>⚡ ميزات متقدمة: <strong>${p.hasChatbot ? 'شات بوت مفعل ✅' : 'شات بوت غير متاح'}</strong></li>
              </ul>
            </div>

            <button class="action-btn action-btn-gold" style="width:100%; justify-content:center; padding:10px;" onclick="AdminPlansModule.editPlan('${p.id}')">
              تعديل السعر والحدود
            </button>
          </div>
        `).join('');
      } catch (err) {
        container.innerHTML = `<div style="color:#DC2626; padding:30px;">تعذر تحميل الباقات</div>`;
      }
    },

    editPlan: function (planId) {
      const plan = this.plans.find((p) => p.id === planId);
      if (!plan) return;
      const newSar = prompt(`أدخل السعر الجديد بالريال السعودي لباقة (${plan.name}):`, plan.priceSAR);
      if (newSar) {
        plan.priceSAR = parseFloat(newSar);
        this.loadPlans();
        WoxCore.showToast(`تم تحديث سعر باقة ${plan.name} إلى ${newSar} ر.س ✅`, 'success');
      }
    },
  };

  window.AdminPlansModule = AdminPlansModule;
  document.addEventListener('DOMContentLoaded', () => AdminPlansModule.init());
})();
