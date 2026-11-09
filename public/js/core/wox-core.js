/**
 * 💎 Wox Core Platform Framework
 * Handles Authentication, Global State, Safe API Requests, Toasts & Fault Isolation Error Boundaries
 */

(function (window) {
  'use strict';

  const WoxCore = {
    // 1. Storage & Authentication Helpers
    getTokens: function () {
      try {
        return JSON.parse(localStorage.getItem('wox_tokens') || '{}');
      } catch (e) {
        return {};
      }
    },

    getUser: function () {
      try {
        return JSON.parse(localStorage.getItem('wox_user') || '{}');
      } catch (e) {
        return {};
      }
    },

    setSession: function (user, tokens) {
      if (user) localStorage.setItem('wox_user', JSON.stringify(user));
      if (tokens) localStorage.setItem('wox_tokens', JSON.stringify(tokens));
    },

    clearSession: function () {
      localStorage.removeItem('wox_user');
      localStorage.removeItem('wox_tokens');
      window.location.href = '/login';
    },

    checkAuth: function (options) {
      const opts = options || {};
      const tokens = this.getTokens();
      const user = this.getUser();

      if (!tokens.accessToken) {
        window.location.href = '/login?redirect=' + encodeURIComponent(window.location.pathname);
        return false;
      }

      if (opts.requireSuperAdmin && user.role !== 'SUPER_ADMIN') {
        window.location.href = '/login?redirect=' + encodeURIComponent(window.location.pathname);
        return false;
      }

      return true;
    },

    // 2. Safe API Request with Auto-Token Refresh & Error Isolation
    api: async function (endpoint, options) {
      const opts = options || {};
      const tokens = this.getTokens();
      const headers = {
        'Content-Type': 'application/json',
        ...(opts.headers || {}),
      };

      if (tokens.accessToken) {
        headers['Authorization'] = `Bearer ${tokens.accessToken}`;
      }

      const url = endpoint.startsWith('/') ? endpoint : `/${endpoint}`;

      try {
        const res = await fetch(url, {
          method: opts.method || 'GET',
          headers: headers,
          body: opts.body ? (typeof opts.body === 'string' ? opts.body : JSON.stringify(opts.body)) : undefined,
        });

        // If 401 Unauthorized, only clear session if it is a central auth validation endpoint
        if (res.status === 401 && (endpoint.includes('/auth/me') || endpoint.includes('/auth/validate'))) {
          this.clearSession();
          throw new Error('انتهت الجلسة، يرجى تسجيل الدخول مجدداً');
        }

        const data = await res.json().catch(() => ({}));
        if (!res.ok) {
          throw new Error(data.message || data.error || `خطأ في الخادم (${res.status})`);
        }

        return data;
      } catch (err) {
        console.error(`[Wox API Error: ${endpoint}]`, err);
        throw err;
      }
    },

    // 3. Global Toast Notification System
    showToast: function (message, type) {
      const toastType = type || 'success'; // 'success' | 'error' | 'info' | 'warning'
      let container = document.getElementById('wox-toast-container');
      if (!container) {
        container = document.createElement('div');
        container.id = 'wox-toast-container';
        document.body.appendChild(container);
      }

      const icons = {
        success: '✅',
        error: '❌',
        warning: '⚠️',
        info: 'ℹ️',
      };

      const toast = document.createElement('div');
      toast.className = `wox-toast wox-toast--${toastType}`;
      toast.innerHTML = `
        <span style="font-size:18px;">${icons[toastType] || 'ℹ️'}</span>
        <span style="flex-grow:1; font-weight:600;">${message}</span>
      `;

      container.appendChild(toast);

      setTimeout(() => {
        toast.style.opacity = '0';
        toast.style.transform = 'translateX(100%)';
        toast.style.transition = 'all 0.3s ease';
        setTimeout(() => toast.remove(), 300);
      }, 4000);
    },

    // 4. Fault Isolation & Error Boundary
    handlePageError: function (pageName, error) {
      console.error(`[Wox Fault Isolation] Error caught in page "${pageName}":`, error);
      const container = document.getElementById('module-content-container') || document.querySelector('main');
      if (container) {
        container.innerHTML = `
          <div style="background:#1E293B; border:1px solid rgba(239,68,68,0.3); border-radius:16px; padding:32px; text-align:center; max-width:600px; margin:40px auto; color:#fff; box-shadow:0 10px 30px rgba(0,0,0,0.5);">
            <div style="font-size:48px; margin-bottom:16px;">⚠️</div>
            <h2 style="font-size:20px; font-weight:800; color:#EF4444; margin-bottom:12px;">تعذر تحميل قسم ${pageName}</h2>
            <p style="color:#94A3B8; font-size:14px; line-height:1.6; margin-bottom:24px;">
              ${error?.message || 'حدث خطأ غير متوقع أثناء معالجة البيانات'}.<br>
              باقي أقسام حسابك تعمل بأمان تام بفضل نظام عزل الأخطاء.
            </p>
            <div style="display:flex; justify-content:center; gap:12px;">
              <button onclick="location.reload()" style="background:#10B981; color:#fff; font-weight:700; border:none; padding:10px 20px; border-radius:10px; cursor:pointer;">
                🔄 إعادة المحاولة
              </button>
              <a href="/dashboard/overview" style="background:#334155; color:#fff; font-weight:700; text-decoration:none; padding:10px 20px; border-radius:10px; display:inline-flex; align-items:center;">
                الرئيسية
              </a>
            </div>
          </div>
        `;
      }
      this.showToast(`تعذر تحميل قسم ${pageName}`, 'error');
    },
  };

  window.WoxCore = WoxCore;
})(window);
