/**
 * Wox WhatsApp - Unified Multi-Platform Analytics & Tracking Engine
 * Supports: Google Analytics 4 (GA4), Meta Pixel (Facebook/Instagram), Snapchat Pixel, TikTok Pixel
 * Zero Emojis | Ox Tech Brand Performance Engineering
 */

(function () {
  'use strict';

  // Global Tracker Object
  window.WoxTracker = {
    initialized: false,
    config: {
      gaMeasurementId: 'G-WOXWHATSAPP',
      metaPixelId: '123456789012345',
      snapchatPixelId: 'snap-wox-saudi-001',
      tiktokPixelId: 'tt-wox-ecommerce-001',
      enabled: true,
    },

    init: async function () {
      try {
        const res = await fetch('/saas/analytics/config');
        const json = await res.json();
        if (json.status === 'success' && json.data) {
          this.config = Object.assign(this.config, json.data);
        }
      } catch (e) {
        // use defaults
      }

      if (!this.config.enabled) return;

      this.initGA4(this.config.gaMeasurementId);
      this.initMetaPixel(this.config.metaPixelId);
      this.initSnapchatPixel(this.config.snapchatPixelId);
      this.initTikTokPixel(this.config.tiktokPixelId);

      this.initialized = true;
      this.trackPageView(document.title, window.location.pathname);
      this.bindAutomaticEvents();
    },

    // 1. Google Analytics 4
    initGA4: function (id) {
      if (!id || window.gtag) return;
      window.dataLayer = window.dataLayer || [];
      window.gtag = function () {
        window.dataLayer.push(arguments);
      };
      window.gtag('js', new Date());
      window.gtag('config', id, { send_page_view: false });

      const script = document.createElement('script');
      script.async = true;
      script.src = 'https://www.googletagmanager.com/gtag/js?id=' + encodeURIComponent(id);
      document.head.appendChild(script);
    },

    // 2. Meta Pixel (Facebook / Instagram)
    initMetaPixel: function (id) {
      if (!id || window.fbq) return;
      (function (f, b, e, v, n, t, s) {
        if (f.fbq) return;
        n = f.fbq = function () {
          n.callMethod ? n.callMethod.apply(n, arguments) : n.queue.push(arguments);
        };
        if (!f._fbq) f._fbq = n;
        n.push = n;
        n.loaded = !0;
        n.version = '2.0';
        n.queue = [];
        t = b.createElement(e);
        t.async = !0;
        t.src = v;
        s = b.getElementsByTagName(e)[0];
        s.parentNode.insertBefore(t, s);
      })(window, document, 'script', 'https://connect.facebook.net/en_US/fbevents.js');

      window.fbq('init', id);
    },

    // 3. Snapchat Pixel (Dominant in Saudi Arabia)
    initSnapchatPixel: function (id) {
      if (!id || window.snaptr) return;
      (function (e, t, n) {
        if (e.snaptr) return;
        var a = (e.snaptr = function () {
          a.handleRequest ? a.handleRequest.apply(a, arguments) : a.queue.push(arguments);
        });
        a.queue = [];
        var s = 'script',
          r = t.createElement(s);
        r.async = !0;
        r.src = n;
        var u = t.getElementsByTagName(s)[0];
        u.parentNode.insertBefore(r, u);
      })(window, document, 'https://sc-static.net/scevent.min.js');

      window.snaptr('init', id);
    },

    // 4. TikTok Pixel (High conversion in Saudi & Egypt)
    initTikTokPixel: function (id) {
      if (!id || window.ttq) return;
      (function (w, d, t) {
        w.TiktokAnalyticsObject = t;
        var ttq = (w[t] = w[t] || []);
        ttq.methods = [
          'page',
          'track',
          'identify',
          'instances',
          'debug',
          'on',
          'off',
          'once',
          'ready',
          'alias',
          'group',
          'enableCookie',
          'disableCookie',
        ];
        ttq.setAndDefer = function (t, e) {
          t[e] = function () {
            t.push([e].concat(Array.prototype.slice.call(arguments, 0)));
          };
        };
        for (var i = 0; i < ttq.methods.length; i++) ttq.setAndDefer(ttq, ttq.methods[i]);
        ttq.instance = function (t) {
          for (var e = ttq._i[t] || [], n = 0; n < ttq.methods.length; n++) ttq.setAndDefer(e, ttq.methods[n]);
          return e;
        };
        ttq.load = function (e, n) {
          var i = 'https://analytics.tiktok.com/i18n/pixel/events.js';
          ttq._i = ttq._i || {};
          ttq._i[e] = [];
          ttq._i[e]._u = i;
          ttq._t = ttq._t || {};
          ttq._t[e] = +new Date();
          ttq._o = ttq._o || {};
          ttq._o[e] = n || {};
          var o = d.createElement('script');
          o.type = 'text/javascript';
          o.async = !0;
          o.src = i + '?sdkid=' + e + '&lib=' + t;
          var a = d.getElementsByTagName('script')[0];
          a.parentNode.insertBefore(o, a);
        };
        ttq.load(id);
      })(window, document, 'ttq');
    },

    // Event: Page View
    trackPageView: function (pageTitle, path) {
      // GA4
      if (window.gtag) {
        window.gtag('event', 'page_view', {
          page_title: pageTitle,
          page_location: window.location.href,
          page_path: path || window.location.pathname,
        });
      }
      // Meta
      if (window.fbq) {
        window.fbq('track', 'PageView');
      }
      // Snapchat
      if (window.snaptr) {
        window.snaptr('track', 'PAGE_VIEW');
      }
      // TikTok
      if (window.ttq) {
        window.ttq.page();
      }
    },

    // Event: View Content (Viewing plans or toggling currency)
    trackViewContent: function (contentName, category, value, currency) {
      const payload = {
        content_name: contentName,
        content_category: category || 'SaaS Plans',
        value: value || 0,
        currency: currency || 'SAR',
      };

      if (window.gtag) window.gtag('event', 'view_item', payload);
      if (window.fbq) window.fbq('track', 'ViewContent', payload);
      if (window.snaptr) window.snaptr('track', 'VIEW_CONTENT', payload);
      if (window.ttq) window.ttq.track('ViewContent', payload);
    },

    // Event: Initiate Checkout (Clicking "ابدأ مجاناً 14 يوم" or choosing a plan)
    trackInitiateCheckout: function (planName, value, currency) {
      const payload = {
        content_name: planName,
        value: value || 0,
        currency: currency || 'SAR',
        num_items: 1,
      };

      if (window.gtag) window.gtag('event', 'begin_checkout', payload);
      if (window.fbq) window.fbq('track', 'InitiateCheckout', payload);
      if (window.snaptr) window.snaptr('track', 'START_CHECKOUT', payload);
      if (window.ttq) window.ttq.track('InitiateCheckout', payload);
    },

    // Event: Lead (Opening registration form / inquiring)
    trackLead: function (source, country) {
      const payload = {
        lead_source: source || 'Landing Page',
        country: country || 'SA',
      };

      if (window.gtag) window.gtag('event', 'generate_lead', payload);
      if (window.fbq) window.fbq('track', 'Lead', payload);
      if (window.snaptr) window.snaptr('track', 'SIGN_UP', payload);
      if (window.ttq) window.ttq.track('SubmitForm', payload);
    },

    // Event: Complete Registration (Account created with 14-day trial)
    trackCompleteRegistration: function (userId, companyName, country) {
      const payload = {
        user_id: userId,
        company_name: companyName,
        country: country || 'SA',
        method: 'Email',
      };

      if (window.gtag) window.gtag('event', 'sign_up', payload);
      if (window.fbq) window.fbq('track', 'CompleteRegistration', payload);
      if (window.snaptr) window.snaptr('track', 'COMPLETE_REGISTRATION', payload);
      if (window.ttq) window.ttq.track('CompleteRegistration', payload);
    },

    // Event: Purchase (Paid subscription upgrade)
    trackPurchase: function (planName, value, currency, transactionId) {
      const payload = {
        transaction_id: transactionId || 'TXN-' + Date.now(),
        value: value,
        currency: currency || 'SAR',
        items: [{ item_name: planName, price: value, quantity: 1 }],
      };

      if (window.gtag) window.gtag('event', 'purchase', payload);
      if (window.fbq) window.fbq('track', 'Purchase', payload);
      if (window.snaptr) window.snaptr('track', 'PURCHASE', payload);
      if (window.ttq) window.ttq.track('CompletePayment', payload);
    },

    // Automatically bind buttons on the Landing Page
    bindAutomaticEvents: function () {
      // Currency buttons
      const sarBtn = document.getElementById('btnCurrencySAR');
      const egpBtn = document.getElementById('btnCurrencyEGP');
      if (sarBtn) {
        sarBtn.addEventListener('click', () => {
          this.trackViewContent('Saudi Market Pricing', 'Currency Toggle', 249, 'SAR');
        });
      }
      if (egpBtn) {
        egpBtn.addEventListener('click', () => {
          this.trackViewContent('Egyptian Market Pricing', 'Currency Toggle', 3299, 'EGP');
        });
      }
    },
  };

  // Initialize on document ready
  document.addEventListener('DOMContentLoaded', function () {
    window.WoxTracker.init();
  });
})();
