/**
 * 📄 Wox Super Admin: Subscriptions & Invoicing Module (Isolated Scope)
 */

(function () {
  'use strict';

  const AdminSubscriptionsModule = {
    init: function () {
      WoxAdminLayout.init('subscriptions');
      this.render();
    },

    render: function () {
      const container = document.getElementById('module-content-container');
      if (!container) return;

      container.innerHTML = `
        <div style="display:flex; justify-content:space-between; align-items:center; margin-bottom:24px;">
          <div>
            <h1 style="font-size:24px; font-weight:800; color:#1C1613; margin-bottom:6px;">الاشتراكات والفوترة والتحويلات</h1>
            <p style="color:#736B63; font-size:14px;">متابعة عمليات الدفع، تجديد الباقات، وتأكيد التحويلات البنكية.</p>
          </div>
          <button class="action-btn action-btn-dark" onclick="WoxCore.showToast('تم تحديث السجلات')">🔄 تحديث</button>
        </div>

        <div style="background:#FFF; border:1px solid #ECE7DE; border-radius:14px; padding:24px; box-shadow:0 2px 10px rgba(0,0,0,0.02);">
          <div style="overflow-x:auto;">
            <table class="admin-table" style="width:100%; border-collapse:collapse; text-align:right;">
              <thead>
                <tr>
                  <th>رقم الفاتورة</th>
                  <th>الشركة</th>
                  <th>الباقة</th>
                  <th>المبلغ</th>
                  <th>طريقة الدفع</th>
                  <th>الحالة</th>
                  <th>الإجراء</th>
                </tr>
              </thead>
              <tbody>
                <tr>
                  <td style="font-family:monospace; font-weight:700;">#INV-2026-091</td>
                  <td>متجر قمة التقنية</td>
                  <td>باقة النمو (Growth)</td>
                  <td style="font-weight:700; color:#1C1613;">249 ر.س</td>
                  <td>💳 مدى (Mada)</td>
                  <td><span class="badge-status badge-active">مدفوع ومكتمل</span></td>
                  <td><button class="action-btn action-btn-dark" style="font-size:11px;" onclick="WoxCore.showToast('تم تحميل الفاتورة')">الفاتورة</button></td>
                </tr>
                <tr>
                  <td style="font-family:monospace; font-weight:700;">#INV-2026-090</td>
                  <td>شركة النيل للحلول</td>
                  <td>باقة الشركات (Scale)</td>
                  <td style="font-weight:700; color:#1C1613;">2,499 ج.م</td>
                  <td>📱 فودافون كاش</td>
                  <td><span class="badge-status badge-active">مدفوع ومكتمل</span></td>
                  <td><button class="action-btn action-btn-dark" style="font-size:11px;" onclick="WoxCore.showToast('تم تحميل الفاتورة')">الفاتورة</button></td>
                </tr>
              </tbody>
            </table>
          </div>
        </div>
      `;
    },
  };

  window.AdminSubscriptionsModule = AdminSubscriptionsModule;
  document.addEventListener('DOMContentLoaded', () => AdminSubscriptionsModule.init());
})();
