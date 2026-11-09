/**
 * 📝 Wox Dashboard: WhatsApp Templates Module (Isolated Scope)
 */

(function () {
  'use strict';

  const TemplatesModule = {
    templates: [],

    init: async function () {
      WoxClientLayout.init('templates');
      this.render();
      try {
        await this.loadTemplates();
      } catch (err) {
        WoxCore.handlePageError('قوالب الرسائل', err);
      }
    },

    render: function () {
      const container = document.getElementById('module-content-container');
      if (!container) return;

      container.innerHTML = `
        <div style="display:flex; justify-content:space-between; align-items:center; margin-bottom:24px;">
          <div>
            <h1 style="font-size:24px; font-weight:800; color:#FFFFFF; margin-bottom:6px;">قوالب الرسائل التلقائية</h1>
            <p style="color:#94A3B8; font-size:14px;">قوالب مسبقة الإعداد لتنبيهات المتاجر، تأكيد الشحن، واستعادة السلات المتروكة.</p>
          </div>
          <button class="wox-btn-primary" onclick="TemplatesModule.createTemplate()">
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><line x1="12" y1="5" x2="12" y2="19"></line><line x1="5" y1="12" x2="19" y2="12"></line></svg>
            إضافة قالب جديد
          </button>
        </div>

        <div id="templates-grid-container" style="display:grid; grid-template-columns:repeat(auto-fill, minmax(320px, 1fr)); gap:20px;">
          <div style="color:#94A3B8; padding:30px; text-align:center;">جاري تحميل القوالب...</div>
        </div>
      `;
    },

    loadTemplates: async function () {
      const container = document.getElementById('templates-grid-container');
      try {
        const res = await WoxCore.api('/saas/data');
        this.templates = (res.data && res.data.templates) || [
          { id: '1', code: 'order_confirmation', title: 'تأكيد الطلب', text: 'تم تأكيد طلبك رقم {{order_id}} بنجاح، جاري التجهيز للشحن.' },
          { id: '2', code: 'order_shipped', title: 'تم الشحن', text: 'تم شحن طلبك رقم {{order_id}}، كود التتبع: {{tracking_number}}' },
          { id: '3', code: 'abandoned_cart', title: 'استعادة السلة المتروكة', text: 'أهلاً بك {{name}}، نسيت بعض المنتجات في سلتك! استخدم كود {{discount_code}} لتحصل على خصم خاص.' },
          { id: '4', code: 'review_request', title: 'طلب تقييم', text: 'نود معرفة رأيك في تجربتك معنا! يرجى تقييم الطلب عبر الرابط: {{link}}' },
        ];

        container.innerHTML = this.templates.map((tpl) => `
          <div class="wox-glass-card" style="padding:22px; display:flex; flex-direction:column; justify-content:space-between;">
            <div>
              <div style="display:flex; justify-content:space-between; align-items:center; margin-bottom:12px;">
                <h4 style="font-size:16px; font-weight:800; color:#FFF; margin:0;">${tpl.title}</h4>
                <span style="font-size:11px; background:rgba(16,185,129,0.15); color:#10B981; padding:3px 8px; border-radius:6px; font-weight:700;">${tpl.code}</span>
              </div>
              <p style="color:#94A3B8; font-size:13px; line-height:1.6; background:#0B141A; padding:12px; border-radius:10px; border:1px solid rgba(255,255,255,0.06);">
                ${tpl.text}
              </p>
            </div>
            <div style="display:flex; gap:8px; margin-top:16px;">
              <button class="action-btn action-btn-dark" style="flex:1; justify-content:center;" onclick="TemplatesModule.copyTemplate('${tpl.text.replace(/'/g, "\\'")}')">
                نسخ النص
              </button>
            </div>
          </div>
        `).join('');
      } catch (err) {
        container.innerHTML = `<div style="color:#EF4444; padding:30px;">فشل تحميل القوالب</div>`;
      }
    },

    copyTemplate: function (text) {
      navigator.clipboard.writeText(text).then(() => {
        WoxCore.showToast('تم نسخ نص القالب إلى الحافظة ✅', 'success');
      });
    },

    createTemplate: function () {
      const title = prompt('أدخل عنوان القالب الجديد:');
      if (!title) return;
      const text = prompt('أدخل نص القالب (يمكنك استخدام المتغيرات مثل {{name}}):');
      if (!text) return;

      this.templates.push({
        id: Date.now().toString(),
        code: 'custom_' + Date.now(),
        title,
        text,
      });

      this.loadTemplates();
      WoxCore.showToast('تمت إضافة القالب الجديد بنجاح ✅', 'success');
    },
  };

  window.TemplatesModule = TemplatesModule;
  document.addEventListener('DOMContentLoaded', () => TemplatesModule.init());
})();
