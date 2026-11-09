/**
 * Wox WhatsApp Platform - Universal Site Branding & Dynamic Logo Engine
 * Developed by Ox Tech
 * Synchronizes Logo, Favicon, Brand Name & Tagline across:
 * - Admin Sidebar (.admin-sidebar-header)
 * - Dashboard Sidebar (.sidebar-brand-box)
 * - Landing Page Header (.landing-brand)
 * - Login & Registration (.auth-brand)
 * - Onboarding Wizard (.wizard-brand)
 */

(function () {
  'use strict';

  function applyBranding(data) {
    if (!data || typeof data !== 'object') return;

    // Cache locally for instantaneous 0ms rendering on subsequent page loads
    try {
      localStorage.setItem('wox_site_branding', JSON.stringify(data));
    } catch (e) {}

    const siteName = data.siteName || 'Wox WhatsApp';
    const siteTagline = data.siteTagline || 'بوابة إرسال رسائل الواتساب والربط السحابي';
    const logoLight = data.logoUrl || '/images/wox-logo.svg';
    const logoDark = data.logoDarkUrl || data.logoUrl || '/images/wox-logo-dark.svg';
    const favicon = data.faviconUrl || '/favicon.ico';

    // 1. Update Favicon
    if (favicon) {
      let fav = document.querySelector('link[rel="icon"]') || document.querySelector('link[rel="shortcut icon"]');
      if (!fav) {
        fav = document.createElement('link');
        fav.rel = 'icon';
        document.head.appendChild(fav);
      }
      fav.href = favicon;
    }

    // 2. Landing Page Navbar Brand (.landing-brand)
    // Clean standalone logo presentation without cluttered duplicate text
    const landingBrands = document.querySelectorAll('.landing-brand');
    landingBrands.forEach(brand => {
      brand.innerHTML = `
        <img src="${logoLight}" alt="${siteName}" class="site-main-logo" style="max-height:42px; max-width:200px; height:auto; width:auto; object-fit:contain; display:block;" onerror="this.onerror=null; this.src='/images/wox-logo.png';">
      `;
      brand.style.display = 'inline-flex';
      brand.style.alignItems = 'center';
      brand.style.textDecoration = 'none';
    });

    // 3. Admin Sidebar Header (.admin-sidebar-header)
    const adminSidebarHeaders = document.querySelectorAll('.admin-sidebar-header');
    adminSidebarHeaders.forEach(header => {
      const brandLink = header.querySelector('a') || header.firstElementChild;
      if (brandLink) {
        brandLink.innerHTML = `
          <img id="adminSidebarLogoImg" class="admin-sidebar-logo-img" src="${logoDark}" alt="${siteName}" style="max-height:40px; max-width:180px; height:auto; width:auto; object-fit:contain; display:block;" onerror="this.onerror=null; this.src='${logoLight}';">
        `;
        brandLink.style.display = 'inline-flex';
        brandLink.style.alignItems = 'center';
        brandLink.style.textDecoration = 'none';
      }
    });

    // 4. Client Dashboard Sidebar (.sidebar-brand-box)
    const sidebarBrandBoxes = document.querySelectorAll('.sidebar-brand-box');
    sidebarBrandBoxes.forEach(box => {
      box.innerHTML = `
        <img src="${logoDark}" alt="${siteName}" class="sidebar-logo-img" style="max-height:58px; max-width:215px; height:auto; width:auto; object-fit:contain; display:block; margin:0 auto;" onerror="this.onerror=null; this.src='${logoLight}';">
      `;
      box.style.display = 'flex';
      box.style.justifyContent = 'center';
      box.style.alignItems = 'center';
      box.style.width = '100%';
      box.style.textAlign = 'center';
      box.style.textDecoration = 'none';
      box.style.margin = '0 auto';
    });

    // 5. Auth Pages (.auth-brand in login.html and register.html)
    const authBrands = document.querySelectorAll('.auth-brand');
    authBrands.forEach(brand => {
      brand.innerHTML = `
        <img src="${logoLight}" alt="${siteName}" style="max-height:48px; max-width:210px; height:auto; width:auto; object-fit:contain; display:block; margin:0 auto;" onerror="this.onerror=null; this.src='/images/wox-logo.png';">
      `;
      brand.style.display = 'flex';
      brand.style.justifyContent = 'center';
      brand.style.textDecoration = 'none';
      brand.style.marginBottom = '20px';
    });

    // 6. Onboarding Wizard (.wizard-brand in wizard.html)
    const wizardBrands = document.querySelectorAll('.wizard-brand');
    wizardBrands.forEach(brand => {
      brand.innerHTML = `
        <img src="${logoLight}" alt="${siteName}" style="max-height:46px; max-width:200px; height:auto; width:auto; object-fit:contain; display:block; margin:0 auto;" onerror="this.onerror=null; this.src='/images/wox-logo.png';">
      `;
      brand.style.display = 'flex';
      brand.style.justifyContent = 'center';
      brand.style.textDecoration = 'none';
      brand.style.marginBottom = '20px';
    });

    // 7. Generic Data Attributes: [data-wox-logo="light"], [data-wox-logo="dark"]
    document.querySelectorAll('img[data-wox-logo="light"]').forEach(el => { el.src = logoLight; el.alt = siteName; });
    document.querySelectorAll('img[data-wox-logo="dark"]').forEach(el => { el.src = logoDark; el.alt = siteName; });
    document.querySelectorAll('[data-wox-brand="name"]').forEach(el => { el.innerText = siteName; });
    document.querySelectorAll('[data-wox-brand="tagline"]').forEach(el => { el.innerText = siteTagline; });

    // 8. Hero / Mockup Video Showcase (Autoplays on page visit)
    if (data.heroVideoUrl) {
      const heroUrl = data.heroVideoUrl.trim();
      const placement = data.heroVideoPlacement || 'full';
      const autoplay = data.heroVideoAutoplay !== false;

      function createVideoEmbed(url, isAuto, isSide) {
        const ytMatch = url.match(/(?:youtu\.be\/|youtube\.com\/(?:embed\/|v\/|watch\?v=|shorts\/|watch\?.+&v=))([\w-]{11})/);
        if (ytMatch && ytMatch[1]) {
          const ytId = ytMatch[1];
          const params = isAuto ? `autoplay=1&mute=1&loop=1&playlist=${ytId}&playsinline=1` : 'autoplay=0';
          return `
            <div style="position:relative; width:100%; height:${isSide ? '360px' : '520px'}; background:#000; overflow:hidden; border-radius:${isSide ? '10px' : '0 0 14px 14px'};">
              <iframe src="https://www.youtube-nocookie.com/embed/${ytId}?${params}&controls=1&modestbranding=1&rel=0" 
                style="position:absolute; top:0; left:0; width:100%; height:100%; border:none;" 
                allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture" 
                allowfullscreen></iframe>
            </div>
          `;
        }

        // Direct HTML5 Video
        const hStyle = isSide ? 'height:100%; min-height:360px;' : 'max-height:560px;';
        const rStyle = isSide ? 'border-radius:10px;' : 'border-radius:0 0 14px 14px;';
        return `
          <div style="position:relative; width:100%; background:#1C1613; overflow:hidden; ${rStyle}">
            <video id="heroShowcaseVideo" src="${url}" ${isAuto ? 'autoplay' : ''} muted loop playsinline style="width:100%; ${hStyle} object-fit:cover; display:block; margin:0 auto;"></video>
            <div style="position:absolute; bottom:16px; left:16px; display:flex; align-items:center; gap:8px; z-index:10;">
              <button id="btnToggleHeroMute" onclick="const v = document.getElementById('heroShowcaseVideo'); if(v){ v.muted = !v.muted; this.innerHTML = v.muted ? '🔊 تشغيل الصوت' : '🔇 كتم الصوت'; }" style="background:rgba(28,22,19,0.85); backdrop-filter:blur(8px); color:#FFF; border:1px solid rgba(255,255,255,0.25); border-radius:8px; padding:6px 14px; font-size:12px; cursor:pointer; font-weight:700; display:flex; align-items:center; gap:6px;">
                🔊 تشغيل الصوت
              </button>
            </div>
          </div>
        `;
      }

      const mockupSidebar = document.querySelector('.mockup-sidebar');
      const mockupBody = document.querySelector('.mockup-body');

      if (placement === 'sidebar' && mockupSidebar) {
        mockupSidebar.innerHTML = createVideoEmbed(heroUrl, autoplay, true);
        mockupSidebar.style.padding = '0';
        mockupSidebar.style.overflow = 'hidden';
      } else if (mockupBody) {
        mockupBody.innerHTML = createVideoEmbed(heroUrl, autoplay, false);
        mockupBody.style.display = 'block';
        mockupBody.style.padding = '0';
      }
    }
  }

  // Expose function globally for real-time live preview & instant admin update
  window.applyWoxBranding = applyBranding;

  // Step 1: Render immediately from localStorage cache if available (0ms delay)
  try {
    const cached = localStorage.getItem('wox_site_branding');
    if (cached) {
      applyBranding(JSON.parse(cached));
    }
  } catch (e) {}

  // Step 2: Fetch latest settings from server asynchronously
  async function fetchAndApplyBranding() {
    try {
      const res = await fetch('/saas/site-settings');
      if (res.ok) {
        const json = await res.json();
        if (json.status === 'success' && json.data) {
          applyBranding(json.data);
        }
      }
    } catch (err) {
      // Quiet fail if offline or API unavailable
    }
  }

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', fetchAndApplyBranding);
  } else {
    fetchAndApplyBranding();
  }
})();
