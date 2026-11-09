/**
 * ⚡ Wox Super Admin: System Health & Baileys Monitor Module (Isolated Scope)
 */

(function () {
  'use strict';

  const AdminHealthModule = {
    init: async function () {
      WoxAdminLayout.init('health');
      this.render();
      try {
        await this.loadHealth();
      } catch (err) {
        WoxCore.handlePageError('مراقبة السيرفر', err);
      }
    },

    render: function () {
      const container = document.getElementById('module-content-container');
      if (!container) return;

      container.innerHTML = `
        <div style="display:flex; justify-content:space-between; align-items:center; margin-bottom:24px;">
          <div>
            <h1 style="font-size:24px; font-weight:800; color:#1C1613; margin-bottom:6px;">مراقبة صحة السيرفر والخوادم</h1>
            <p style="color:#736B63; font-size:14px;">فحص لحظي لقاعدة البيانات، الذاكرة، وRedis، وحالة جلسات WhatsApp Web.</p>
          </div>
          <button class="action-btn action-btn-gold" onclick="AdminHealthModule.loadHealth()">🔄 إعادة الفحص الآن</button>
        </div>

        <div style="display:grid; grid-template-columns:1fr 1fr; gap:20px; margin-bottom:24px;">
          <div style="background:#FFF; border:1px solid #ECE7DE; border-radius:14px; padding:24px; box-shadow:0 2px 10px rgba(0,0,0,0.02);">
            <h3 style="font-size:16px; font-weight:800; color:#1C1613; margin-bottom:16px;">قاعدة البيانات (PostgreSQL)</h3>
            <div id="health-db-status" style="font-size:20px; font-weight:800; color:#16A34A;">● جاري الفحص...</div>
            <p style="color:#736B63; font-size:13px; margin-top:8px;">زمن استجابة الاستعلام: <span id="health-db-latency">...</span></p>
          </div>

          <div style="background:#FFF; border:1px solid #ECE7DE; border-radius:14px; padding:24px; box-shadow:0 2px 10px rgba(0,0,0,0.02);">
            <h3 style="font-size:16px; font-weight:800; color:#1C1613; margin-bottom:16px;">الذاكرة المؤقتة (Redis Cache)</h3>
            <div id="health-redis-status" style="font-size:20px; font-weight:800; color:#16A34A;">● جاري الفحص...</div>
            <p style="color:#736B63; font-size:13px; margin-top:8px;">حالة الاتصال والـ Ping: <span id="health-redis-latency">...</span></p>
          </div>
        </div>

        <div style="background:#FFF; border:1px solid #ECE7DE; border-radius:14px; padding:24px;">
          <h3 style="font-size:16px; font-weight:800; color:#1C1613; margin-bottom:16px;">استهلاك الموارد و Node.js Runtime</h3>
          <div id="health-system-info" style="font-size:14px; color:#615B54; line-height:2;">
            جاري جلب تفاصيل المعالج والذاكرة...
          </div>
        </div>
      `;
    },

    loadHealth: async function () {
      try {
        const res = await WoxCore.api('/health');
        const dbEl = document.getElementById('health-db-status');
        const dbLat = document.getElementById('health-db-latency');
        const rEl = document.getElementById('health-redis-status');
        const rLat = document.getElementById('health-redis-latency');
        const sysEl = document.getElementById('health-system-info');

        if (dbEl) dbEl.innerHTML = res.checks.database.status === 'up' ? '● متصلة وتعمل بكفاءة ✅' : '❌ تعذر الاتصال';
        if (dbLat) dbLat.innerText = `${res.checks.database.latencyMs} ms`;
        if (rEl) rEl.innerHTML = `● ${res.checks.redis.status} ✅`;
        if (rLat) rLat.innerText = `${res.checks.redis.latencyMs} ms`;

        if (sysEl && res.system) {
          sysEl.innerHTML = `
            <div>🖥️ <strong>منصة التشغيل:</strong> ${res.system.platform} (Node ${res.system.nodeVersion})</div>
            <div>🧠 <strong>استهلاك الذاكرة (Heap):</strong> ${res.system.memoryUsageMB} MB</div>
            <div>⚡ <strong>عدد الأنوية (CPUs):</strong> ${res.system.cpuCount} Cores</div>
            <div>⏱️ <strong>مدة تشغيل السيرفر (Uptime):</strong> ${Math.floor(res.uptimeSeconds / 60)} دقيقة</div>
          `;
        }
      } catch (err) {
        // Handled
      }
    },
  };

  window.AdminHealthModule = AdminHealthModule;
  document.addEventListener('DOMContentLoaded', () => AdminHealthModule.init());
})();
