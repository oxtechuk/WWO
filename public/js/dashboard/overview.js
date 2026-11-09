/**
 * 📊 Wox Dashboard: Overview & Analytics Module (Isolated Scope)
 */

(function () {
  'use strict';

  const OverviewModule = {
    init: async function () {
      WoxClientLayout.init('overview');
      this.render();
      try {
        await this.loadData();
      } catch (err) {
        WoxCore.handlePageError('الرئيسية والإحصائيات', err);
      }
    },

    render: function () {
      const container = document.getElementById('module-content-container');
      if (!container) return;

      container.innerHTML = `
        <!-- Welcome Hero Banner -->
        <div class="welcome-hero-card" style="margin-bottom:28px;">
          <div class="welcome-text-col">
            <h1 class="welcome-title">أهلاً بك في منصة Wox WhatsApp</h1>
            <p class="welcome-subtitle">لوحة التحكم السحابية المتقدمة لإدارة قنوات واتساب، تنبيهات المتاجر، والأتمتة الذكية.</p>
            <div style="display:flex; gap:12px; margin-top:16px;">
              <a href="/dashboard/instances" class="wox-btn-primary" style="text-decoration:none;">
                <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><line x1="12" y1="5" x2="12" y2="19"></line><line x1="5" y1="12" x2="19" y2="12"></line></svg>
                ربط رقم جديد
              </a>
              <a href="/dashboard/messages" class="action-btn action-btn-dark" style="text-decoration:none; padding:10px 18px; border-radius:12px;">
                إرسال رسالة سريعة
              </a>
            </div>
          </div>
        </div>

        <!-- 4 Key Metric Cards -->
        <div class="metrics-grid" style="display:grid; grid-template-columns:repeat(auto-fit, minmax(240px, 1fr)); gap:20px; margin-bottom:28px;">
          <div class="wox-glass-card metric-card" style="padding:22px;">
            <div style="display:flex; justify-content:space-between; align-items:center; margin-bottom:12px;">
              <span style="font-size:14px; color:#A89F96; font-weight:600;">الأرقام المتصلة</span>
              <span class="wox-status-dot online"></span>
            </div>
            <div id="stat-instances-count" style="font-size:28px; font-weight:800; color:#FFFFFF;">1 / 3</div>
            <div style="font-size:12px; color:#10B981; margin-top:6px;">● جاهز للإرسال والاستقبال</div>
          </div>

          <div class="wox-glass-card metric-card" style="padding:22px;">
            <div style="display:flex; justify-content:space-between; align-items:center; margin-bottom:12px;">
              <span style="font-size:14px; color:#A89F96; font-weight:600;">الرسائل المرسلة اليوم</span>
              <span style="font-size:18px;">📨</span>
            </div>
            <div id="stat-sent-count" style="font-size:28px; font-weight:800; color:#FFFFFF;">1,420</div>
            <div style="font-size:12px; color:#3B82F6; margin-top:6px;">↑ 18% مقارنة بالأمس</div>
          </div>

          <div class="wox-glass-card metric-card" style="padding:22px;">
            <div style="display:flex; justify-content:space-between; align-items:center; margin-bottom:12px;">
              <span style="font-size:14px; color:#A89F96; font-weight:600;">نسبة تسليم الرسائل</span>
              <span style="font-size:18px;">🎯</span>
            </div>
            <div style="font-size:28px; font-weight:800; color:#10B981;">99.8%</div>
            <div style="font-size:12px; color:#10B981; margin-top:6px;">معدل تسليم فائق</div>
          </div>

          <div class="wox-glass-card metric-card" style="padding:22px;">
            <div style="display:flex; justify-content:space-between; align-items:center; margin-bottom:12px;">
              <span style="font-size:14px; color:#A89F96; font-weight:600;">حالة الخادم و Baileys</span>
              <span style="font-size:18px;">⚡</span>
            </div>
            <div style="font-size:24px; font-weight:800; color:#FFFFFF;">مستقر 100%</div>
            <div style="font-size:12px; color:#10B981; margin-top:6px;">زمن الاستجابة: 24ms</div>
          </div>
        </div>

        <!-- Quick Access Shortcuts -->
        <div class="wox-glass-card" style="padding:28px;">
          <h3 style="font-size:18px; font-weight:800; margin-bottom:20px; color:#FFFFFF;">الوصول السريع للأدوات</h3>
          <div style="display:grid; grid-template-columns:repeat(auto-fit, minmax(200px, 1fr)); gap:16px;">
            <a href="/dashboard/instances" class="action-btn action-btn-dark" style="text-decoration:none; padding:16px; border-radius:12px; display:flex; flex-direction:column; align-items:flex-start; gap:8px;">
              <span style="font-size:20px;">📱</span>
              <span style="font-weight:700; color:#FFF;">إدارة الأرقام والـ QR</span>
              <span style="font-size:12px; color:#94A3B8;">ربط وتفعيل قنوات واتساب</span>
            </a>
            <a href="/dashboard/templates" class="action-btn action-btn-dark" style="text-decoration:none; padding:16px; border-radius:12px; display:flex; flex-direction:column; align-items:flex-start; gap:8px;">
              <span style="font-size:20px;">📝</span>
              <span style="font-weight:700; color:#FFF;">قوالب الرسائل الجاهزة</span>
              <span style="font-size:12px; color:#94A3B8;">تنبيهات الطلبات والسلات المتروكة</span>
            </a>
            <a href="/dashboard/webhooks" class="action-btn action-btn-dark" style="text-decoration:none; padding:16px; border-radius:12px; display:flex; flex-direction:column; align-items:flex-start; gap:8px;">
              <span style="font-size:20px;">🔗</span>
              <span style="font-weight:700; color:#FFF;">ربط المتاجر والويب هوك</span>
              <span style="font-size:12px; color:#94A3B8;">سلة، زد، ووكومرس وشوبيفاي</span>
            </a>
            <a href="/dashboard/developers" class="action-btn action-btn-dark" style="text-decoration:none; padding:16px; border-radius:12px; display:flex; flex-direction:column; align-items:flex-start; gap:8px;">
              <span style="font-size:20px;">💻</span>
              <span style="font-weight:700; color:#FFF;">API والمطورين</span>
              <span style="font-size:12px; color:#94A3B8;">مفاتيح الربط والتوثيق المباشر</span>
            </a>
          </div>
        </div>
      `;
    },

    loadData: async function () {
      try {
        const instances = await WoxCore.api('/instance/fetchInstances');
        if (Array.isArray(instances)) {
          const el = document.getElementById('stat-instances-count');
          if (el) el.innerText = `${instances.length} رقم`;
        }
      } catch (e) {
        // Fallback gracefully
      }
    },
  };

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', () => OverviewModule.init());
  } else {
    OverviewModule.init();
  }
})();
