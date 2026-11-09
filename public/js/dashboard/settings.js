/**
 * ⚙️ Wox Dashboard: Account Settings & Company Profile Module (Isolated Scope)
 */

(function () {
  'use strict';

  const SettingsModule = {
    init: function () {
      WoxClientLayout.init('settings');
      this.render();
    },

    render: function () {
      const container = document.getElementById('module-content-container');
      if (!container) return;

      const user = WoxCore.getUser() || {};

      container.innerHTML = `
        <div style="margin-bottom:24px;">
          <h1 style="font-size:24px; font-weight:800; color:#FFFFFF; margin-bottom:6px;">إعدادات الحساب والشركة</h1>
          <p style="color:#94A3B8; font-size:14px;">تحديث بيانات الحساب، كلمات المرور، ومعلومات الشركة والفواتير.</p>
        </div>

        <div style="max-width:600px;">
          <div class="wox-glass-card" style="padding:28px;">
            <h3 style="font-size:18px; font-weight:800; color:#FFF; margin-bottom:20px;">الملف الشخصي</h3>

            <div style="margin-bottom:16px;">
              <label style="display:block; font-size:13px; font-weight:700; color:#C3BCB5; margin-bottom:6px;">الاسم الكامل:</label>
              <input type="text" id="setting-name" value="${user.name || 'المستخدم'}" style="width:100%; background:#1E293B; border:1px solid rgba(255,255,255,0.12); color:#FFF; padding:12px; border-radius:10px; font-size:14px; box-sizing:border-box;">
            </div>

            <div style="margin-bottom:16px;">
              <label style="display:block; font-size:13px; font-weight:700; color:#C3BCB5; margin-bottom:6px;">البريد الإلكتروني:</label>
              <input type="email" id="setting-email" readonly value="${user.email || 'user@oxtech.com'}" style="width:100%; background:#0B141A; border:1px solid rgba(255,255,255,0.06); color:#94A3B8; padding:12px; border-radius:10px; font-size:14px; box-sizing:border-box;">
            </div>

            <div style="margin-bottom:24px;">
              <label style="display:block; font-size:13px; font-weight:700; color:#C3BCB5; margin-bottom:6px;">نوع الباقة الحالية:</label>
              <input type="text" readonly value="${user.role === 'SUPER_ADMIN' ? '👑 Super Administrator' : 'باقة النمو والتجارة (Growth)'}" style="width:100%; background:#0B141A; border:1px solid rgba(255,255,255,0.06); color:#10B981; font-weight:700; padding:12px; border-radius:10px; font-size:14px; box-sizing:border-box;">
            </div>

            <button class="wox-btn-primary" style="width:100%; justify-content:center; padding:12px;" onclick="WoxCore.showToast('تم حفظ التغييرات بنجاح ✅')">
              حفظ التعديلات
            </button>
          </div>
        </div>
      `;
    },
  };

  window.SettingsModule = SettingsModule;
  document.addEventListener('DOMContentLoaded', () => SettingsModule.init());
})();
