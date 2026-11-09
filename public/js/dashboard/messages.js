/**
 * 📨 Wox Dashboard: WhatsApp Messages & Live Dispatch Module (Isolated Scope)
 */

(function () {
  'use strict';

  const MessagesModule = {
    instances: [],

    init: async function () {
      WoxClientLayout.init('messages');
      this.render();
      try {
        await this.loadActiveInstances();
      } catch (err) {
        WoxCore.handlePageError('إرسال الرسائل', err);
      }
    },

    render: function () {
      const container = document.getElementById('module-content-container');
      if (!container) return;

      container.innerHTML = `
        <div style="margin-bottom:24px;">
          <h1 style="font-size:24px; font-weight:800; color:#FFFFFF; margin-bottom:6px;">إرسال الرسائل والمحادثات</h1>
          <p style="color:#94A3B8; font-size:14px;">أرسل رسائل نصية، وسائط، أو قوالب تفاعلية فورية لأي رقم في العالم.</p>
        </div>

        <div style="display:grid; grid-template-columns:1fr 1fr; gap:24px;">
          <!-- Left: Send Message Form -->
          <div class="wox-glass-card" style="padding:28px;">
            <h3 style="font-size:18px; font-weight:800; color:#FFF; margin-bottom:20px;">إنشاء وإرسال رسالة</h3>

            <div style="margin-bottom:16px;">
              <label style="display:block; font-size:13px; font-weight:700; color:#C3BCB5; margin-bottom:6px;">اختر القناة / الرقم المرسل:</label>
              <select id="msg-instance-select" style="width:100%; background:#1E293B; border:1px solid rgba(255,255,255,0.12); color:#FFF; padding:12px; border-radius:10px; font-size:14px;">
                <option value="">جاري تحميل الأرقام المتصلة...</option>
              </select>
            </div>

            <div style="margin-bottom:16px;">
              <label style="display:block; font-size:13px; font-weight:700; color:#C3BCB5; margin-bottom:6px;">رقم هاتف المستلم (مع المفتاح الدولي):</label>
              <input type="text" id="msg-recipient-input" placeholder="مثال: 966501234567 أو 201001234567" style="width:100%; background:#1E293B; border:1px solid rgba(255,255,255,0.12); color:#FFF; padding:12px; border-radius:10px; font-size:14px; box-sizing:border-box;">
            </div>

            <div style="margin-bottom:20px;">
              <label style="display:block; font-size:13px; font-weight:700; color:#C3BCB5; margin-bottom:6px;">نص الرسالة:</label>
              <textarea id="msg-text-input" rows="5" placeholder="اكتب نص الرسالة هنا..." style="width:100%; background:#1E293B; border:1px solid rgba(255,255,255,0.12); color:#FFF; padding:12px; border-radius:10px; font-size:14px; box-sizing:border-box; resize:vertical;"></textarea>
            </div>

            <button class="wox-btn-primary" style="width:100%; justify-content:center; padding:14px; font-size:15px;" onclick="MessagesModule.sendMessage()">
              <span>🚀 إرسال الرسالة الآن</span>
            </button>
          </div>

          <!-- Right: Live Preview & Speed Stats -->
          <div class="wox-glass-card" style="padding:28px; display:flex; flex-direction:column; justify-content:space-between;">
            <div>
              <h3 style="font-size:18px; font-weight:800; color:#FFF; margin-bottom:16px;">معاينة الرسالة (WhatsApp Preview)</h3>
              <div style="background:#0B141A; border:1px solid rgba(255,255,255,0.1); border-radius:16px; padding:20px; min-height:200px; display:flex; flex-direction:column; justify-content:flex-end;">
                <div style="background:#005C4B; color:#E9EDEF; padding:12px 16px; border-radius:10px 0 10px 10px; align-self:flex-end; max-width:80%; font-size:14px; line-height:1.5; box-shadow:0 1px 3px rgba(0,0,0,0.3);" id="msg-preview-box">
                  اكتب رسالتك وستظهر المعاينة الحية هنا...
                </div>
              </div>
            </div>

            <div style="border-top:1px solid rgba(255,255,255,0.08); padding-top:20px; margin-top:20px;">
              <div style="font-size:13px; color:#A89F96; line-height:1.8;">
                ⚡ <strong>محرك الإرسال فائق السرعة:</strong> يتم الإرسال عبر مصفوفة WebSockets وBaileys مباشرة دون وسيط.
              </div>
            </div>
          </div>
        </div>
      `;

      const input = document.getElementById('msg-text-input');
      if (input) {
        input.addEventListener('input', (e) => {
          const preview = document.getElementById('msg-preview-box');
          if (preview) {
            preview.innerText = e.target.value || 'اكتب رسالتك وستظهر المعاينة الحية هنا...';
          }
        });
      }
    },

    loadActiveInstances: async function () {
      const select = document.getElementById('msg-instance-select');
      try {
        const res = await WoxCore.api('/instance/fetchInstances');
        this.instances = Array.isArray(res) ? res : (res.data || []);

        if (this.instances.length === 0) {
          select.innerHTML = '<option value="">لا توجد أرقام متصلة - يرجى ربط رقم أولاً</option>';
          return;
        }

        select.innerHTML = this.instances.map((i) => {
          const name = i.name || i.instanceName;
          return `<option value="${name}">${name} (${i.connectionStatus?.state === 'open' ? 'متصل ✅' : 'غير متصل'})</option>`;
        }).join('');
      } catch (err) {
        select.innerHTML = '<option value="">فشل تحميل الأرقام</option>';
      }
    },

    sendMessage: async function () {
      const instance = document.getElementById('msg-instance-select')?.value;
      const number = document.getElementById('msg-recipient-input')?.value?.trim();
      const text = document.getElementById('msg-text-input')?.value?.trim();

      if (!instance) return WoxCore.showToast('يرجى اختيار قناة الإرسال', 'warning');
      if (!number) return WoxCore.showToast('يرجى إدخال رقم هاتف المستلم', 'warning');
      if (!text) return WoxCore.showToast('يرجى كتابة نص الرسالة', 'warning');

      const cleanNumber = number.replace(/[^0-9]/g, '');

      try {
        WoxCore.showToast('جاري إرسال الرسالة...', 'info');
        await WoxCore.api(`/message/sendText/${instance}`, {
          method: 'POST',
          body: {
            number: cleanNumber,
            textMessage: { text: text },
          },
        });
        WoxCore.showToast('تم إرسال الرسالة بنجاح ✅', 'success');
        document.getElementById('msg-text-input').value = '';
        document.getElementById('msg-preview-box').innerText = 'تم الإرسال بنجاح ✅';
      } catch (err) {
        WoxCore.showToast(err.message || 'فشل إرسال الرسالة', 'error');
      }
    },
  };

  window.MessagesModule = MessagesModule;
  document.addEventListener('DOMContentLoaded', () => MessagesModule.init());
})();
