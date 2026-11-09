/**
 * 💻 Wox Dashboard: Developer API & SDK Integration Module (Isolated Scope)
 */

(function () {
  'use strict';

  const DevelopersModule = {
    init: function () {
      WoxClientLayout.init('developers');
      this.render();
    },

    render: function () {
      const container = document.getElementById('module-content-container');
      if (!container) return;

      const tokens = WoxCore.getTokens();
      const apiKey = tokens.accessToken || 'wox_live_sk_9874561230abcdef';

      container.innerHTML = `
        <div style="margin-bottom:24px;">
          <h1 style="font-size:24px; font-weight:800; color:#FFFFFF; margin-bottom:6px;">بوابة المطورين والـ API</h1>
          <p style="color:#94A3B8; font-size:14px;">اربط منصة Wox بتطبيقاتك، برمجياتك، وخوادمك عبر أسرع REST API وSDK رسمي.</p>
        </div>

        <div style="display:grid; grid-template-columns:1fr 1fr; gap:24px;">
          <!-- API Keys Box -->
          <div class="wox-glass-card" style="padding:28px;">
            <h3 style="font-size:18px; font-weight:800; color:#FFF; margin-bottom:16px;">مفاتيح الربط والتوثيق (API Credentials)</h3>

            <div style="margin-bottom:16px;">
              <label style="display:block; font-size:13px; font-weight:700; color:#C3BCB5; margin-bottom:6px;">رابط الخادم (Base Server URL):</label>
              <input type="text" readonly value="${window.location.origin}" style="width:100%; background:#1E293B; border:1px solid rgba(255,255,255,0.12); color:#10B981; padding:12px; border-radius:10px; font-size:14px; font-family:monospace; box-sizing:border-box;">
            </div>

            <div style="margin-bottom:20px;">
              <label style="display:block; font-size:13px; font-weight:700; color:#C3BCB5; margin-bottom:6px;">مفتاح الـ API الخاص بحسابك (Authorization Key):</label>
              <input type="text" readonly value="${apiKey}" style="width:100%; background:#1E293B; border:1px solid rgba(255,255,255,0.12); color:#FFF; padding:12px; border-radius:10px; font-size:13px; font-family:monospace; box-sizing:border-box;">
            </div>

            <div style="display:flex; gap:10px;">
              <button class="wox-btn-primary" onclick="navigator.clipboard.writeText('${apiKey}'); WoxCore.showToast('تم نسخ مفتاح الـ API ✅')">
                نسخ المفتاح
              </button>
              <a href="/docs/openapi.yaml" target="_blank" class="action-btn action-btn-dark" style="text-decoration:none; padding:10px 16px;">
                تحميل توثيق OpenAPI 3.1
              </a>
            </div>
          </div>

          <!-- Code Snippet Box -->
          <div class="wox-glass-card" style="padding:28px;">
            <h3 style="font-size:18px; font-weight:800; color:#FFF; margin-bottom:16px;">مثال برمجي للإرسال السريع (Node.js / cURL)</h3>
            <pre style="background:#0B141A; border:1px solid rgba(255,255,255,0.1); color:#E2E8F0; padding:16px; border-radius:12px; font-size:13px; font-family:monospace; overflow-x:auto; line-height:1.5;">curl -X POST ${window.location.origin}/message/sendText/MyInstance \\
  -H "apikey: ${apiKey.slice(0, 20)}..." \\
  -H "Content-Type: application/json" \\
  -d '{
    "number": "966501234567",
    "textMessage": {
      "text": "مرحباً بك من خلال Wox WhatsApp API!"
    }
  }'</pre>
          </div>
        </div>
      `;
    },
  };

  window.DevelopersModule = DevelopersModule;
  document.addEventListener('DOMContentLoaded', () => DevelopersModule.init());
})();
