/**
 * 📈 Wox Super Admin: Analytics & Pixels Tracking Module (Isolated Scope)
 */

(function () {
  'use strict';

  const AdminAnalyticsModule = {
    init: async function () {
      WoxAdminLayout.init('analytics');
      this.render();
      try {
        await this.loadConfig();
      } catch (err) {
        WoxCore.handlePageError('إعدادات التتبع والإعلانات', err);
      }
    },

    render: function () {
      const container = document.getElementById('module-content-container');
      if (!container) return;

      container.innerHTML = `
        <div style="margin-bottom:24px;">
          <h1 style="font-size:24px; font-weight:800; color:#1C1613; margin-bottom:6px;">التتبع الإعلاني وبيكسلات التسويق (Marketing Pixels)</h1>
          <p style="color:#736B63; font-size:14px;">ربط معرفات سناب شات، تيك توك، ميتا فيسبوك، وGoogle Analytics بصفحة الهبوط والتسجيل.</p>
        </div>

        <div style="max-width:700px; background:#FFF; border:1px solid #ECE7DE; border-radius:14px; padding:28px; box-shadow:0 2px 10px rgba(0,0,0,0.02);">
          <div style="margin-bottom:18px;">
            <label style="display:block; font-size:13px; font-weight:700; color:#1C1613; margin-bottom:6px;">Google Analytics (GA4 Measurement ID):</label>
            <input type="text" id="ga-id" placeholder="G-XXXXXXXXXX" style="width:100%; border:1px solid #D9D2C7; padding:12px; border-radius:8px; font-size:14px; box-sizing:border-box;">
          </div>

          <div style="margin-bottom:18px;">
            <label style="display:block; font-size:13px; font-weight:700; color:#1C1613; margin-bottom:6px;">Meta Pixel ID (Facebook & Instagram):</label>
            <input type="text" id="meta-id" placeholder="123456789012345" style="width:100%; border:1px solid #D9D2C7; padding:12px; border-radius:8px; font-size:14px; box-sizing:border-box;">
          </div>

          <div style="margin-bottom:18px;">
            <label style="display:block; font-size:13px; font-weight:700; color:#1C1613; margin-bottom:6px;">Snapchat Pixel ID:</label>
            <input type="text" id="snap-id" placeholder="snap-xxxx-xxxx" style="width:100%; border:1px solid #D9D2C7; padding:12px; border-radius:8px; font-size:14px; box-sizing:border-box;">
          </div>

          <div style="margin-bottom:24px;">
            <label style="display:block; font-size:13px; font-weight:700; color:#1C1613; margin-bottom:6px;">TikTok Pixel ID:</label>
            <input type="text" id="tiktok-id" placeholder="tt-xxxx-xxxx" style="width:100%; border:1px solid #D9D2C7; padding:12px; border-radius:8px; font-size:14px; box-sizing:border-box;">
          </div>

          <button class="action-btn action-btn-gold" style="width:100%; justify-content:center; padding:12px; font-size:15px;" onclick="AdminAnalyticsModule.saveConfig()">
            حفظ إعدادات البيكسل
          </button>
        </div>
      `;
    },

    loadConfig: async function () {
      try {
        const res = await WoxCore.api('/saas/admin/analytics-config');
        if (res.data) {
          const d = res.data;
          if (document.getElementById('ga-id')) document.getElementById('ga-id').value = d.gaMeasurementId || '';
          if (document.getElementById('meta-id')) document.getElementById('meta-id').value = d.metaPixelId || '';
          if (document.getElementById('snap-id')) document.getElementById('snap-id').value = d.snapchatPixelId || '';
          if (document.getElementById('tiktok-id')) document.getElementById('tiktok-id').value = d.tiktokPixelId || '';
        }
      } catch (err) {}
    },

    saveConfig: async function () {
      const payload = {
        gaMeasurementId: document.getElementById('ga-id')?.value?.trim(),
        metaPixelId: document.getElementById('meta-id')?.value?.trim(),
        snapchatPixelId: document.getElementById('snap-id')?.value?.trim(),
        tiktokPixelId: document.getElementById('tiktok-id')?.value?.trim(),
      };

      try {
        await WoxCore.api('/saas/admin/analytics-config', {
          method: 'POST',
          body: payload,
        });
        WoxCore.showToast('تم حفظ وتحديث البيكسلات بنجاح ✅', 'success');
      } catch (err) {
        WoxCore.showToast(err.message || 'فشل حفظ الإعدادات', 'error');
      }
    },
  };

  window.AdminAnalyticsModule = AdminAnalyticsModule;
  document.addEventListener('DOMContentLoaded', () => AdminAnalyticsModule.init());
})();
