/**
 * ⚙️ Wox Super Admin: Site Settings & SEO Customization Module (Isolated Scope)
 */

(function () {
  'use strict';

  const AdminSiteSettingsModule = {
    init: async function () {
      WoxAdminLayout.init('site-settings');
      this.render();
      try {
        await this.loadSettings();
      } catch (err) {
        WoxCore.handlePageError('إعدادات الموقع و SEO', err);
      }
    },

    render: function () {
      const container = document.getElementById('module-content-container');
      if (!container) return;

      container.innerHTML = `
        <div style="margin-bottom:24px;">
          <h1 style="font-size:24px; font-weight:800; color:#1C1613; margin-bottom:6px;">إعدادات الموقع، اللوجو ومحركات البحث (SEO)</h1>
          <p style="color:#736B63; font-size:14px;">تعديل الهوية البصرية، العناوين، والوصف لمحركات البحث وشبكات التواصل.</p>
        </div>

        <div style="max-width:750px; background:#FFF; border:1px solid #ECE7DE; border-radius:14px; padding:28px; box-shadow:0 2px 10px rgba(0,0,0,0.02);">
          <div style="margin-bottom:18px;">
            <label style="display:block; font-size:13px; font-weight:700; color:#1C1613; margin-bottom:6px;">اسم المنصة (Site Name):</label>
            <input type="text" id="site-name" value="Wox WhatsApp" style="width:100%; border:1px solid #D9D2C7; padding:12px; border-radius:8px; font-size:14px; box-sizing:border-box;">
          </div>

          <div style="margin-bottom:18px;">
            <label style="display:block; font-size:13px; font-weight:700; color:#1C1613; margin-bottom:6px;">عنوان الصفحة لمحركات البحث (SEO Title):</label>
            <input type="text" id="seo-title" value="Wox WhatsApp | بوابة الواتساب السحابية وحلول الربط الذكي" style="width:100%; border:1px solid #D9D2C7; padding:12px; border-radius:8px; font-size:14px; box-sizing:border-box;">
          </div>

          <div style="margin-bottom:18px;">
            <label style="display:block; font-size:13px; font-weight:700; color:#1C1613; margin-bottom:6px;">وصف المنصة (SEO Meta Description):</label>
            <textarea id="seo-desc" rows="3" style="width:100%; border:1px solid #D9D2C7; padding:12px; border-radius:8px; font-size:14px; box-sizing:border-box; resize:vertical;">المنصة الرائدة لربط الواتساب بمتجرك وووكومرس وتطبيقاتك: إشعارات الطلبات اللحظية، استرجاع السلات المتروكة، بوتات ذكاء اصطناعي وأرقام افتراضية.</textarea>
          </div>

          <div style="margin-bottom:24px;">
            <label style="display:block; font-size:13px; font-weight:700; color:#1C1613; margin-bottom:6px;">نص حقوق الملكية في الفوتر:</label>
            <input type="text" id="footer-text" value="جميع الحقوق محفوظة © Wox WhatsApp - إحدى منصات Ox Tech" style="width:100%; border:1px solid #D9D2C7; padding:12px; border-radius:8px; font-size:14px; box-sizing:border-box;">
          </div>

          <button class="action-btn action-btn-gold" style="width:100%; justify-content:center; padding:12px; font-size:15px;" onclick="AdminSiteSettingsModule.saveSettings()">
            حفظ إعدادات الهوية و SEO
          </button>
        </div>
      `;
    },

    loadSettings: async function () {
      try {
        const res = await WoxCore.api('/saas/admin/site-settings');
        if (res.data) {
          const d = res.data;
          if (document.getElementById('site-name')) document.getElementById('site-name').value = d.siteName || '';
          if (document.getElementById('seo-title')) document.getElementById('seo-title').value = d.seoTitle || '';
          if (document.getElementById('seo-desc')) document.getElementById('seo-desc').value = d.seoDescription || '';
          if (document.getElementById('footer-text')) document.getElementById('footer-text').value = d.footerText || '';
        }
      } catch (err) {}
    },

    saveSettings: async function () {
      const payload = {
        siteName: document.getElementById('site-name')?.value?.trim(),
        seoTitle: document.getElementById('seo-title')?.value?.trim(),
        seoDescription: document.getElementById('seo-desc')?.value?.trim(),
        footerText: document.getElementById('footer-text')?.value?.trim(),
      };

      try {
        await WoxCore.api('/saas/admin/site-settings', {
          method: 'POST',
          body: payload,
        });
        WoxCore.showToast('تم حفظ إعدادات الموقع و SEO بنجاح ✅', 'success');
      } catch (err) {
        WoxCore.showToast(err.message || 'فشل حفظ الإعدادات', 'error');
      }
    },
  };

  window.AdminSiteSettingsModule = AdminSiteSettingsModule;
  document.addEventListener('DOMContentLoaded', () => AdminSiteSettingsModule.init());
})();
