/**
 * ⚡ Wox Dashboard: Automation & AI Chatbot Module (Isolated Scope)
 */

(function () {
  'use strict';

  const AutomationModule = {
    rules: [],

    init: async function () {
      WoxClientLayout.init('automation');
      this.render();
      try {
        await this.loadRules();
      } catch (err) {
        WoxCore.handlePageError('الأتمتة والرد الذكي', err);
      }
    },

    render: function () {
      const container = document.getElementById('module-content-container');
      if (!container) return;

      container.innerHTML = `
        <div style="display:flex; justify-content:space-between; align-items:center; margin-bottom:24px;">
          <div>
            <h1 style="font-size:24px; font-weight:800; color:#FFFFFF; margin-bottom:6px;">محرك الأتمتة والردود الذكية</h1>
            <p style="color:#94A3B8; font-size:14px;">قواعد الرد التلقائي حسب الكلمات المفتاحية وربط شات بوت الذكاء الاصطناعي.</p>
          </div>
          <button class="wox-btn-primary" onclick="AutomationModule.addRule()">
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><line x1="12" y1="5" x2="12" y2="19"></line><line x1="5" y1="12" x2="19" y2="12"></line></svg>
            إضافة قاعدة جديدة
          </button>
        </div>

        <div class="wox-glass-card" style="padding:24px;">
          <div id="rules-container" style="display:flex; flex-direction:column; gap:16px;">
            <div style="color:#94A3B8; text-align:center; padding:20px;">جاري تحميل القواعد...</div>
          </div>
        </div>
      `;
    },

    loadRules: async function () {
      const container = document.getElementById('rules-container');
      try {
        const res = await WoxCore.api('/saas/data');
        this.rules = (res.data && res.data.automationRules) || [
          { id: '1', keyword: 'السعر', match: 'يحتوي', reply: 'أسعار باقاتنا تبدأ من 99 ر.س شهرياً، يمكنك الاطلاع على العروض عبر متجرنا.', active: true },
          { id: '2', keyword: 'مرحبا', match: 'يحتوي', reply: 'أهلاً بك في منصة Wox! كيف يمكن لفريقنا مساعدتك اليوم؟', active: true },
          { id: '3', keyword: 'دعم', match: 'تطابق تام', reply: 'تم تحويلك إلى فريق خدمة العملاء المباشر، سيتواصل معك أحد ممثلينا فوراً.', active: true },
        ];

        container.innerHTML = this.rules.map((r) => `
          <div style="background:#0B141A; border:1px solid rgba(255,255,255,0.08); padding:18px; border-radius:14px; display:flex; justify-content:space-between; align-items:center;">
            <div style="flex:1;">
              <div style="display:flex; align-items:center; gap:10px; margin-bottom:8px;">
                <span style="background:rgba(16,185,129,0.15); color:#10B981; font-weight:800; padding:3px 10px; border-radius:6px; font-size:12px;">
                  إذا كانت الرسالة ${r.match} "${r.keyword}"
                </span>
                <span style="font-size:11px; color:#10B981; font-weight:700;">● مفعلة</span>
              </div>
              <div style="color:#E2E8F0; font-size:14px; line-height:1.5;">
                💬 الرد: ${r.reply}
              </div>
            </div>
            <div>
              <button class="action-btn action-btn-danger" onclick="AutomationModule.deleteRule('${r.id}')">حذف</button>
            </div>
          </div>
        `).join('');
      } catch (err) {
        container.innerHTML = `<div style="color:#EF4444; padding:20px; text-align:center;">تعذر تحميل القواعد</div>`;
      }
    },

    addRule: function () {
      const keyword = prompt('أدخل الكلمة المفتاحية (مثال: الشحن، السعر، السلام عليكم):');
      if (!keyword) return;
      const reply = prompt('أدخل نص الرد التلقائي:');
      if (!reply) return;

      this.rules.unshift({
        id: Date.now().toString(),
        keyword,
        match: 'يحتوي',
        reply,
        active: true,
      });

      this.loadRules();
      WoxCore.showToast('تمت إضافة قاعدة الرد التلقائي بنجاح ✅', 'success');
    },

    deleteRule: function (id) {
      this.rules = this.rules.filter((r) => r.id !== id);
      this.loadRules();
      WoxCore.showToast('تم حذف القاعدة', 'info');
    },
  };

  window.AutomationModule = AutomationModule;
  document.addEventListener('DOMContentLoaded', () => AutomationModule.init());
})();
