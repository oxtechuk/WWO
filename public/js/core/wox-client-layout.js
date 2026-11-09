/**
 * 💎 Wox Client Layout Component
 * Standardizes Sidebar, Top Navigation Header, Search, Profile, and Active Route Highlighting across all client pages
 */

(function (window) {
  'use strict';

  const NAV_ITEMS = [
    {
      id: 'overview',
      title: 'الرئيسية',
      href: '/dashboard/overview',
      icon: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M3 9l9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z"/><polyline points="9 22 9 12 15 12 15 22"/></svg>',
    },
    {
      id: 'instances',
      title: 'الانستنتات',
      href: '/dashboard/instances',
      icon: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><polygon points="12 2 2 7 12 12 22 7 12 2"><polyline points="2 17 12 22 22 17"/><polyline points="2 12 12 17 22 12"/></polygon></svg>',
    },
    {
      id: 'messages',
      title: 'الرسائل',
      href: '/dashboard/messages',
      icon: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z"/></svg>',
    },
    {
      id: 'templates',
      title: 'القوالب',
      href: '/dashboard/templates',
      icon: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M14.5 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V7.5L14.5 2z"/><polyline points="14 2 14 8 20 8"/><line x1="16" y1="13" x2="8" y2="13"/><line x1="16" y1="17" x2="8" y2="17"/><line x1="10" y1="9" x2="8" y2="9"/></svg>',
    },
    {
      id: 'contacts',
      title: 'جهات الاتصال',
      href: '/dashboard/contacts',
      icon: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M16 21v-2a4 4 0 0 0-4-4H6a4 4 0 0 0-4 4v2"/><circle cx="9" cy="7" r="4"/><path d="M22 21v-2a4 4 0 0 0-3-3.87"/><path d="M16 3.13a4 4 0 0 1 0 7.75"/></svg>',
    },
    {
      id: 'webhooks',
      title: 'الويب هوكس',
      href: '/dashboard/webhooks',
      icon: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M10 13a5 5 0 0 0 7.54.54l3-3a5 5 0 0 0-7.07-7.07l-1.72 1.71"/><path d="M14 11a5 5 0 0 0-7.54-.54l-3 3a5 5 0 0 0 7.07 7.07l1.71-1.71"/></svg>',
    },
    {
      id: 'automation',
      title: 'الأتمتة',
      href: '/dashboard/automation',
      icon: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><polygon points="13 2 3 14 12 14 11 22 21 10 12 10 13 2"/></svg>',
    },
    {
      id: 'logs',
      title: 'السجلات',
      href: '/dashboard/logs',
      icon: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><line x1="8" y1="6" x2="21" y2="6"/><line x1="8" y1="12" x2="21" y2="12"/><line x1="8" y1="18" x2="21" y2="18"/><line x1="3" y1="6" x2="3.01" y2="6"/><line x1="3" y1="12" x2="3.01" y2="12"/><line x1="3" y1="18" x2="3.01" y2="18"/></svg>',
    },
    {
      id: 'developers',
      title: 'المطورين',
      href: '/dashboard/developers',
      icon: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><polyline points="16 18 22 12 16 6"/><polyline points="8 6 2 12 8 18"/></svg>',
    },
    {
      id: 'settings',
      title: 'الإعدادات',
      href: '/dashboard/settings',
      icon: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><circle cx="12" cy="12" r="3"/><path d="M19.4 15a1.65 1.65 0 0 0 .33 1.82l.06.06a2 2 0 0 1 0 2.83 2 2 0 0 1-2.83 0l-.06-.06a1.65 1.65 0 0 0-1.82-.33 1.65 1.65 0 0 0-1 1.51V21a2 2 0 0 1-2 2 2 2 0 0 1-2-2v-.09A1.65 1.65 0 0 0 9 19.4a1.65 1.65 0 0 0-1.82.33l-.06.06a2 2 0 0 1-2.83 0 2 2 0 0 1 0-2.83l.06-.06a1.65 1.65 0 0 0 .33-1.82 1.65 1.65 0 0 0-1.51-1H3a2 2 0 0 1-2-2 2 2 0 0 1 2-2h.09A1.65 1.65 0 0 0 4.6 9a1.65 1.65 0 0 0-.33-1.82l-.06-.06a2 2 0 0 1 0-2.83 2 2 0 0 1 2.83 0l.06.06a1.65 1.65 0 0 0 1.82.33H9a1.65 1.65 0 0 0 1-1.51V3a2 2 0 0 1 2-2 2 2 0 0 1 2 2v.09a1.65 1.65 0 0 0 1 1.51 1.65 1.65 0 0 0 1.82-.33l.06-.06a2 2 0 0 1 2.83 0 2 2 0 0 1 0 2.83l-.06.06a1.65 1.65 0 0 0-.33 1.82V9a1.65 1.65 0 0 0 1.51 1H21a2 2 0 0 1 2 2 2 2 0 0 1-2 2h-.09a1.65 1.65 0 0 0-1.51 1z"/></svg>',
    },
  ];

  function renderClientLayout(activePageId) {
    const user = (window.WoxCore && window.WoxCore.getUser()) || {};
    const userName = user.name || 'المستخدم';
    const userRole = user.role === 'SUPER_ADMIN' ? 'مدير النظام' : 'مشترك باقة النمو';

    const navHtml = NAV_ITEMS.map((item) => {
      const isActive = item.id === activePageId;
      return `
        <a class="sidebar-nav-item ${isActive ? 'active' : ''}" href="${item.href}" id="nav-${item.id}">
          <span class="nav-icon">${item.icon}</span>
          <span>${item.title}</span>
        </a>
      `;
    }).join('');

    const layoutHtml = `
      <div class="wox-master-app">
        <!-- 1. Master Sidebar (Left-positioned in RTL layout) -->
        <aside class="wox-sidebar-left">
          <div>
            <!-- Brand Logo & Platform Title -->
            <a href="/dashboard/overview" class="sidebar-brand-container sidebar-brand-box" style="text-decoration:none; color:inherit;">
              <img src="/images/wox-logo.png" alt="Wox Logo" class="sidebar-logo-img">
              <div class="sidebar-brand-text">
                <span class="brand-title sidebar-brand-title">Wox WhatsApp</span>
                <span class="brand-subtitle sidebar-brand-slogan">Ox Tech Platform</span>
              </div>
            </a>

            <!-- Navigation Links -->
            <nav class="sidebar-nav-list">
              ${navHtml}
            </nav>
          </div>

          <!-- Bottom Sidebar Area: Upgrade Card & Support Link -->
          <div>
            <div class="sidebar-upgrade-card">
              <div class="upgrade-card-header">
                <span style="width: 18px; height: 18px; color: var(--wox-gold-btn); display: inline-flex;">
                  <svg viewBox="0 0 24 24" fill="currentColor"><path d="M5 16L3 5l5.5 5L12 4l3.5 6L21 5l-2 11H5zm14 3c0 .6-.4 1-1 1H6c-.6 0-1-.4-1-1v-1h14v1z"/></svg>
                </span>
                <span>تطوير أعمالك يبدأ من هنا</span>
              </div>
              <p class="upgrade-card-desc">خطط مرنة تناسب الشركات والمتاجر</p>
              <a href="/landing#pricing" class="upgrade-btn" style="text-decoration:none; display:block; text-align:center;">ترقية الخطة</a>
            </div>

            <a href="https://wa.me/966500000000" target="_blank" class="sidebar-support-link">
              <span style="width: 16px; height: 16px; display: inline-flex;">
                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M3 18v-6a9 9 0 0 1 18 0v6"/><path d="M21 19a2 2 0 0 1-2 2h-1a2 2 0 0 1-2-2v-3a2 2 0 0 1 2-2h3zM3 19a2 2 0 0 0 2 2h1a2 2 0 0 0 2-2v-3a2 2 0 0 0-2-2H3z"/></svg>
              </span>
              <span>تحتاج مساعدة؟ تواصل مع الدعم</span>
            </a>
          </div>
        </aside>

        <!-- 2. Workspace Canvas -->
        <main class="wox-canvas-main">
          <!-- Persistent Header Bar -->
          <header class="canvas-header">
            <div class="header-search-container">
              <span class="search-kbd-badge">⌘ K</span>
              <input type="text" id="global-search-input" class="search-input" placeholder="ابحث في الرسائل، جهات الاتصال، أو القوالب...">
            </div>

            <div class="header-controls">
              <button class="notification-btn" title="التنبيهات" onclick="WoxCore.showToast('لا توجد تنبيهات جديدة')">
                <svg style="width: 18px; height: 18px;" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M18 8A6 6 0 0 0 6 8c0 7-3 9-3 9h18s-3-2-3-9"/><path d="M13.73 21a2 2 0 0 1-3.46 0"/></svg>
                <span class="notification-dot"></span>
              </button>

              <button class="lang-selector-pill" onclick="WoxCore.showToast('اللغة: العربية (الافتراضية)')">
                <svg class="flag-icon-svg" viewBox="0 0 24 16" width="20" height="14" style="border-radius: 2px; flex-shrink: 0;">
                  <rect width="24" height="16" fill="#006C35"/>
                  <path d="M4 11h16M7 7.5h10M9 5h6" stroke="#FFFFFF" stroke-width="1.2" stroke-linecap="round"/>
                </svg>
                <span>العربية</span>
              </button>

              <div class="user-profile-badge" onclick="location.href='/dashboard/settings'" style="cursor:pointer;">
                <div class="user-info-col">
                  <span class="user-name-text">${userName}</span>
                  <span class="user-role-text">${userRole}</span>
                </div>
                <img src="/images/wox-logo.png" alt="User Avatar" class="user-avatar-img">
              </div>

              <button class="action-btn action-btn-danger" style="padding:6px 12px; margin-right:8px;" onclick="WoxCore.clearSession()" title="تسجيل الخروج">
                خروج
              </button>
            </div>
          </header>

          <!-- Dynamic Page Content Container -->
          <div class="page-content-wrapper" id="module-content-container">
            <!-- Injected by page script -->
          </div>
        </main>
      </div>
    `;

    document.body.innerHTML = layoutHtml;
  }

  window.WoxClientLayout = {
    init: function (activePageId) {
      if (window.WoxCore) {
        window.WoxCore.checkAuth();
      }
      renderClientLayout(activePageId);
    },
  };
})(window);
