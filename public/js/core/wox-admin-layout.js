/**
 * 💎 Wox Admin Layout Component
 * Standardizes Admin Sidebar, Top Navigation, KPIs Bar, and Active Route Highlighting across all Super Admin pages
 */

(function (window) {
  'use strict';

  const ADMIN_NAV_ITEMS = [
    {
      id: 'overview',
      title: 'نظرة عامة وإحصائيات',
      href: '/admin/overview',
      icon: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><rect x="3" y="3" width="7" height="9"></rect><rect x="14" y="3" width="7" height="5"></rect><rect x="14" y="12" width="7" height="9"></rect><rect x="3" y="16" width="7" height="5"></rect></svg>',
    },
    {
      id: 'tenants',
      title: 'المشتركون والشركات',
      href: '/admin/tenants',
      icon: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2"></path><circle cx="9" cy="7" r="4"></circle><path d="M23 21v-2a4 4 0 0 0-3-3.87"></path><path d="M16 3.13a4 4 0 0 1 0 7.75"></path></svg>',
    },
    {
      id: 'plans',
      title: 'إدارة الباقات والأسعار',
      href: '/admin/plans',
      icon: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2"></polygon></svg>',
    },
    {
      id: 'subscriptions',
      title: 'الاشتراكات والفوترة',
      href: '/admin/subscriptions',
      icon: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><rect x="1" y="4" width="22" height="16" rx="2" ry="2"></rect><line x1="1" y1="10" x2="23" y2="10"></line></svg>',
    },
    {
      id: 'numbers',
      title: 'مخزن الأرقام الافتراضية',
      href: '/admin/numbers',
      icon: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M22 16.92v3a2 2 0 0 1-2.18 2 19.79 19.79 0 0 1-8.63-3.07 19.5 19.5 0 0 1-6-6 19.79 19.79 0 0 1-3.07-8.67A2 2 0 0 1 4.11 2h3a2 2 0 0 1 2 1.72 12.84 12.84 0 0 0 .7 2.81 2 2 0 0 1-.45 2.11L8.09 9.91a16 16 0 0 0 6 6l1.27-1.27a2 2 0 0 1 2.11-.45 12.84 12.84 0 0 0 2.81.7A2 2 0 0 1 22 16.92z"></path></svg>',
    },
    {
      id: 'health',
      title: 'مراقبة السيرفر ومحرك Baileys',
      href: '/admin/health',
      icon: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><polyline points="22 12 18 12 15 21 9 3 6 12 2 12"></polyline></svg>',
    },
    {
      id: 'analytics',
      title: 'التتبع والإعلانات (Pixels)',
      href: '/admin/analytics',
      icon: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M18 20V10"></path><path d="M12 20V4"></path><path d="M6 20v-6"></path></svg>',
    },
    {
      id: 'site-settings',
      title: 'إعدادات الموقع، اللوجو و SEO',
      href: '/admin/site-settings',
      icon: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><circle cx="12" cy="12" r="3"></circle><path d="M19.4 15a1.65 1.65 0 0 0 .33 1.82l.06.06a2 2 0 0 1 0 2.83 2 2 0 0 1-2.83 0l-.06-.06a1.65 1.65 0 0 0-1.82-.33 1.65 1.65 0 0 0-1 1.51V21a2 2 0 0 1-2 2 2 2 0 0 1-2-2v-.09A1.65 1.65 0 0 0 9 19.4a1.65 1.65 0 0 0-1.82.33l-.06.06a2 2 0 0 1-2.83 0 2 2 0 0 1 0-2.83l.06-.06a1.65 1.65 0 0 0 .33-1.82 1.65 1.65 0 0 0-1.51-1H3a2 2 0 0 1-2-2 2 2 0 0 1 2-2h.09A1.65 1.65 0 0 0 4.6 9a1.65 1.65 0 0 0-.33-1.82l-.06-.06a2 2 0 0 1 0-2.83 2 2 0 0 1 2.83 0l.06.06a1.65 1.65 0 0 0 1.82.33H9a1.65 1.65 0 0 0 1-1.51V3a2 2 0 0 1 2-2 2 2 0 0 1 2 2v.09a1.65 1.65 0 0 0 1 1.51 1.65 1.65 0 0 0 1.82-.33l.06-.06a2 2 0 0 1 2.83 0 2 2 0 0 1 0 2.83l-.06.06a1.65 1.65 0 0 0-.33 1.82V9a1.65 1.65 0 0 0 1.51 1H21a2 2 0 0 1 2 2 2 2 0 0 1-2 2h-.09a1.65 1.65 0 0 0-1.51 1z"></path></svg>',
    },
  ];

  function renderAdminLayout(activePageId) {
    const user = (window.WoxCore && window.WoxCore.getUser()) || {};
    const userName = user.name || 'مدير النظام المركزي';

    const navHtml = ADMIN_NAV_ITEMS.map((item) => {
      const isActive = item.id === activePageId;
      return `
        <li>
          <a class="admin-nav-item ${isActive ? 'active' : ''}" href="${item.href}" id="admin-nav-${item.id}">
            ${item.icon}
            <span>${item.title}</span>
          </a>
        </li>
      `;
    }).join('');

    const layoutHtml = `
      <div class="admin-layout-container" style="display:flex; height:100vh; overflow:hidden;">
        <!-- 1. Admin Sidebar -->
        <aside class="admin-sidebar" style="width:280px; background:#181412; color:#C3BCB5; padding:24px 16px; display:flex; flex-direction:column; flex-shrink:0; border-left:1px solid rgba(255,255,255,0.06);">
          <div class="admin-sidebar-header" style="padding-bottom:20px; margin-bottom:20px; border-bottom:1px solid rgba(255,255,255,0.08);">
            <div style="display:flex; align-items:center; gap:12px;">
              <img src="/images/wox-logo.png" alt="Wox Logo" style="width:36px; height:36px; border-radius:8px;">
              <div>
                <div style="font-size:16px; font-weight:800; color:#FFFFFF;">Wox Admin</div>
                <div style="font-size:12px; color:#A89F96;">لوحة الإدارة والتحكم الشاملة</div>
              </div>
            </div>
            <div class="admin-badge-super" style="display:inline-flex; align-items:center; gap:6px; padding:4px 10px; background:rgba(197, 155, 109, 0.16); color:#D4AF37; border:1px solid rgba(197, 155, 109, 0.3); border-radius:9999px; font-size:11px; font-weight:700; margin-top:8px;">
              <span>👑 Super Administrator</span>
            </div>
          </div>

          <ul class="admin-nav" style="list-style:none; display:flex; flex-direction:column; gap:6px; flex-grow:1; padding:0; margin:0;">
            ${navHtml}
          </ul>

          <div style="border-top:1px solid rgba(255,255,255,0.08); padding-top:16px; display:flex; flex-direction:column; gap:8px;">
            <a href="/dashboard/overview" class="action-btn action-btn-gold" style="justify-content:center; text-align:center;">
              الدخول للوحة العميل
            </a>
            <a href="/landing" class="action-btn action-btn-dark" style="justify-content:center; text-align:center; background:rgba(255,255,255,0.08);">
              صفحة الهبوط (Landing)
            </a>
          </div>
        </aside>

        <!-- 2. Admin Main Canvas -->
        <main class="admin-content" style="flex-grow:1; display:flex; flex-direction:column; overflow-y:auto; height:100vh; background:#F7F5F0;">
          <header class="admin-topbar" style="height:70px; background:#FFFFFF; border-bottom:1px solid #ECE7DE; padding:0 32px; display:flex; align-items:center; justify-content:space-between; position:sticky; top:0; z-index:10;">
            <div style="display:flex; align-items:center; gap:16px;">
              <span style="font-size:18px; font-weight:800; color:#1C1613;">التحكم الإداري المركزي</span>
              <span class="badge-status badge-active" style="display:inline-flex; align-items:center; gap:6px; padding:4px 10px; border-radius:9999px; font-size:12px; font-weight:700; background:#E8F8EE; color:#16A34A;">
                ● السيرفر متصل ومستقر
              </span>
            </div>

            <div style="display:flex; align-items:center; gap:16px;">
              <div style="text-align:left;">
                <div style="font-size:14px; font-weight:700; color:#1C1613;">${userName}</div>
                <div style="font-size:11px; color:#8C827A;">مدير النظام التنفيذي</div>
              </div>
              <button class="action-btn action-btn-danger" style="padding:6px 12px;" onclick="WoxCore.clearSession()">
                خروج
              </button>
            </div>
          </header>

          <div class="admin-page-body" id="module-content-container" style="padding:32px;">
            <!-- Injected by specific Admin page script -->
          </div>
        </main>
      </div>
    `;

    document.body.innerHTML = layoutHtml;
  }

  window.WoxAdminLayout = {
    init: function (activePageId) {
      if (window.WoxCore) {
        window.WoxCore.checkAuth({ requireSuperAdmin: true });
      }
      renderAdminLayout(activePageId);
    },
  };
})(window);
