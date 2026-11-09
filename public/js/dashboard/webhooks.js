/**
 * 🔗 Wox Dashboard: Webhooks & Store Integrations Module (Isolated Scope)
 */

(function () {
  'use strict';

  const WebhooksModule = {
    init: function () {
      WoxClientLayout.init('webhooks');
      this.render();
    },

    render: function () {
      const container = document.getElementById('module-content-container');
      if (!container) return;

      container.innerHTML = `
        <div style="margin-bottom:24px;">
          <h1 style="font-size:24px; font-weight:800; color:#FFFFFF; margin-bottom:6px;">الويب هوكس والربط السحابي</h1>
          <p style="color:#94A3B8; font-size:14px;">استقبل أحداث الرسائل الواردة، حالات التسليم، وتنبيهات المتاجر في الوقت الفعلي.</p>
        </div>

        <div style="display:grid; grid-template-columns:1fr 1fr; gap:24px;">
          <div class="wox-glass-card" style="padding:28px;">
            <h3 style="font-size:18px; font-weight:800; color:#FFF; margin-bottom:16px;">إعدادات Webhook V2 للرسائل</h3>

            <div style="margin-bottom:16px;">
              <label style="display:block; font-size:13px; font-weight:700; color:#C3BCB5; margin-bottom:6px;">رابط الـ Webhook (Endpoint URL):</label>
              <input type="url" id="webhook-url-input" placeholder="https://yourstore.com/api/whatsapp-webhook" style="width:100%; background:#1E293B; border:1px solid rgba(255,255,255,0.12); color:#FFF; padding:12px; border-radius:10px; font-size:14px; box-sizing:border-box;">
            </div>

            <div style="margin-bottom:16px;">
              <label style="display:block; font-size:13px; font-weight:700; color:#C3BCB5; margin-bottom:6px;">المفتاح السري للتوقيع (HMAC Secret):</label>
              <input type="text" id="webhook-secret-input" value="wox_sec_7894561230" style="width:100%; background:#1E293B; border:1px solid rgba(255,255,255,0.12); color:#FFF; padding:12px; border-radius:10px; font-size:14px; box-sizing:border-box; font-family:monospace;">
            </div>

            <div style="margin-bottom:20px;">
              <label style="display:block; font-size:13px; font-weight:700; color:#C3BCB5; margin-bottom:10px;">الأحداث المشترك بها:</label>
              <div style="display:flex; flex-direction:column; gap:8px;">
                <label style="color:#FFF; font-size:13px; display:flex; align-items:center; gap:8px;">
                  <input type="checkbox" checked> <span>MESSAGES_UPSERT (الرسائل الواردة والصادرة)</span>
                </label>
                <label style="color:#FFF; font-size:13px; display:flex; align-items:center; gap:8px;">
                  <input type="checkbox" checked> <span>MESSAGES_UPDATE (تحديث حالة التسليم والقراءة)</span>
                </label>
                <label style="color:#FFF; font-size:13px; display:flex; align-items:center; gap:8px;">
                  <input type="checkbox" checked> <span>CONNECTION_UPDATE (تغير حالة اتصال الرقم)</span>
                </label>
              </div>
            </div>

            <button class="wox-btn-primary" style="width:100%; justify-content:center; padding:12px;" onclick="WoxCore.showToast('تم حفظ إعدادات الـ Webhook بنجاح ✅')">
              حفظ وتفعيل Webhook
            </button>
          </div>

          <div class="wox-glass-card" style="padding:28px;">
            <h3 style="font-size:18px; font-weight:800; color:#FFF; margin-bottom:16px;">الربط مع المنصات الجاهزة</h3>
            <div style="display:flex; flex-direction:column; gap:12px;">
              <div style="background:#0B141A; border:1px solid rgba(255,255,255,0.08); padding:16px; border-radius:12px; display:flex; justify-content:space-between; align-items:center;">
                <div>
                  <div style="font-weight:700; color:#FFF;">🛍️ متجر سلة (Salla)</div>
                  <div style="font-size:12px; color:#94A3B8;">إشعارات فورية وتتبع الشحنات</div>
                </div>
                <button class="action-btn action-btn-gold" onclick="WoxCore.showToast('تم تجهيز تطبيق سلة، جاري التوصيل...')">توصيل</button>
              </div>

              <div style="background:#0B141A; border:1px solid rgba(255,255,255,0.08); padding:16px; border-radius:12px; display:flex; justify-content:space-between; align-items:center;">
                <div>
                  <div style="font-weight:700; color:#FFF;">🏪 متجر زد (Zid)</div>
                  <div style="font-size:12px; color:#94A3B8;">استعادة السلات وتأكيد الطلب</div>
                </div>
                <button class="action-btn action-btn-gold" onclick="WoxCore.showToast('تم تجهيز تطبيق زد، جاري التوصيل...')">توصيل</button>
              </div>

              <div style="background:#0B141A; border:1px solid rgba(255,255,255,0.08); padding:16px; border-radius:12px; display:flex; justify-content:space-between; align-items:center;">
                <div>
                  <div style="font-weight:700; color:#FFF;">🛒 ووكومرس (WooCommerce)</div>
                  <div style="font-size:12px; color:#94A3B8;">إضافة ووردبريس الرسمية</div>
                </div>
                <a href="/wordpress-plugin.zip" download class="action-btn action-btn-dark" style="text-decoration:none;">تحميل الإضافة</a>
              </div>
            </div>
          </div>
        </div>
      `;
    },
  };

  window.WebhooksModule = WebhooksModule;
  document.addEventListener('DOMContentLoaded', () => WebhooksModule.init());
})();
