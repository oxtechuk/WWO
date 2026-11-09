/**
 * 📜 Wox Dashboard: Activity & Dispatch Logs Module (Isolated Scope)
 */

(function () {
  'use strict';

  const LogsModule = {
    init: function () {
      WoxClientLayout.init('logs');
      this.render();
    },

    render: function () {
      const container = document.getElementById('module-content-container');
      if (!container) return;

      container.innerHTML = `
        <div style="display:flex; justify-content:space-between; align-items:center; margin-bottom:24px;">
          <div>
            <h1 style="font-size:24px; font-weight:800; color:#FFFFFF; margin-bottom:6px;">سجلات الرسائل والنشاط</h1>
            <p style="color:#94A3B8; font-size:14px;">تتبع لحظي لكافة الرسائل الصادرة والواردة وحالات التسليم والقراءة.</p>
          </div>
          <button class="action-btn action-btn-dark" onclick="LogsModule.render()">🔄 تحديث السجل</button>
        </div>

        <div class="wox-glass-card" style="padding:24px;">
          <div style="overflow-x:auto;">
            <table style="width:100%; border-collapse:collapse; text-align:right;">
              <thead>
                <tr style="border-bottom:1px solid rgba(255,255,255,0.1); color:#A89F96; font-size:13px;">
                  <th style="padding:12px;">الوقت</th>
                  <th style="padding:12px;">القناة</th>
                  <th style="padding:12px;">المستلم</th>
                  <th style="padding:12px;">محتوى الرسالة</th>
                  <th style="padding:12px;">الحالة</th>
                </tr>
              </thead>
              <tbody>
                <tr style="border-bottom:1px solid rgba(255,255,255,0.05); color:#FFF; font-size:13px;">
                  <td style="padding:12px; color:#94A3B8;">منذ دقيقتين</td>
                  <td style="padding:12px; font-weight:700;">Main_Store</td>
                  <td style="padding:12px; font-family:monospace; direction:ltr; text-align:right;">+966501234567</td>
                  <td style="padding:12px;">تم تأكيد طلبك رقم #1098 بنجاح ✅</td>
                  <td style="padding:12px;"><span style="background:rgba(16,185,129,0.15); color:#10B981; padding:3px 8px; border-radius:6px; font-weight:700;">تم التسليم (READ)</span></td>
                </tr>
                <tr style="border-bottom:1px solid rgba(255,255,255,0.05); color:#FFF; font-size:13px;">
                  <td style="padding:12px; color:#94A3B8;">منذ 5 دقائق</td>
                  <td style="padding:12px; font-weight:700;">Main_Store</td>
                  <td style="padding:12px; font-family:monospace; direction:ltr; text-align:right;">+201001234567</td>
                  <td style="padding:12px;">استعادة سلة متروكة كود خصم WOX10</td>
                  <td style="padding:12px;"><span style="background:rgba(16,185,129,0.15); color:#10B981; padding:3px 8px; border-radius:6px; font-weight:700;">تم التسليم (DELIVERED)</span></td>
                </tr>
                <tr style="border-bottom:1px solid rgba(255,255,255,0.05); color:#FFF; font-size:13px;">
                  <td style="padding:12px; color:#94A3B8;">منذ 12 دقيقة</td>
                  <td style="padding:12px; font-weight:700;">Main_Store</td>
                  <td style="padding:12px; font-family:monospace; direction:ltr; text-align:right;">+966559876543</td>
                  <td style="padding:12px;">كود التحقق الخاص بك هو: 849201</td>
                  <td style="padding:12px;"><span style="background:rgba(16,185,129,0.15); color:#10B981; padding:3px 8px; border-radius:6px; font-weight:700;">مقروءة (READ)</span></td>
                </tr>
              </tbody>
            </table>
          </div>
        </div>
      `;
    },
  };

  window.LogsModule = LogsModule;
  document.addEventListener('DOMContentLoaded', () => LogsModule.init());
})();
