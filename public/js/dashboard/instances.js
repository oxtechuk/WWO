/**
 * 📱 Wox Dashboard: WhatsApp Instances & QR Code Pairing Module (Isolated Scope)
 */

(function () {
  'use strict';

  const InstancesModule = {
    instances: [],

    init: async function () {
      WoxClientLayout.init('instances');
      this.renderSkeleton();
      try {
        await this.loadInstances();
      } catch (err) {
        WoxCore.handlePageError('الأرقام وقنوات واتساب', err);
      }
    },

    renderSkeleton: function () {
      const container = document.getElementById('module-content-container');
      if (!container) return;

      container.innerHTML = `
        <div style="display:flex; justify-content:space-between; align-items:center; margin-bottom:24px;">
          <div>
            <h1 style="font-size:24px; font-weight:800; color:#FFFFFF; margin-bottom:6px;">إدارة الأرقام وقنوات الواتساب</h1>
            <p style="color:#94A3B8; font-size:14px;">قم بربط أرقامك السحابية ومسح الـ QR Code لتفعيل الإرسال التلقائي.</p>
          </div>
          <button class="wox-btn-primary" onclick="InstancesModule.openCreateModal()">
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><line x1="12" y1="5" x2="12" y2="19"></line><line x1="5" y1="12" x2="19" y2="12"></line></svg>
            إنشاء جلسة / ربط رقم جديد
          </button>
        </div>

        <div id="instances-list-container" style="display:grid; grid-template-columns:repeat(auto-fill, minmax(320px, 1fr)); gap:20px;">
          <div style="color:#94A3B8; padding:30px; text-align:center;">جاري تحميل القنوات والجلسات...</div>
        </div>

        <!-- Modal QR Code -->
        <div id="qr-modal" style="display:none; position:fixed; inset:0; background:rgba(0,0,0,0.75); z-index:9999; align-items:center; justify-content:center; backdrop-filter:blur(8px);">
          <div class="wox-glass-card" style="background:#0F172A; border:1px solid rgba(255,255,255,0.15); padding:32px; border-radius:20px; width:90%; max-width:420px; text-align:center;">
            <h3 id="qr-instance-title" style="color:#FFF; font-size:18px; font-weight:800; margin-bottom:12px;">مسح رمز الاستجابة السريعة (QR)</h3>
            <p style="color:#94A3B8; font-size:13px; margin-bottom:20px;">افتح تطبيق WhatsApp على هاتفك > الأجهزة المرتبطة > ربط جهاز.</p>
            <div id="qr-image-wrapper" style="background:#FFF; padding:16px; border-radius:12px; display:inline-block; margin-bottom:20px; min-width:220px; min-height:220px;">
              <div style="color:#333; padding-top:80px; font-size:13px;">جاري توليد الرمز...</div>
            </div>
            <div>
              <button class="action-btn action-btn-dark" onclick="InstancesModule.closeQrModal()" style="width:100%; justify-content:center; padding:10px;">إغلاق</button>
            </div>
          </div>
        </div>
      `;
    },

    loadInstances: async function () {
      const container = document.getElementById('instances-list-container');
      try {
        const res = await WoxCore.api('/instance/fetchInstances');
        this.instances = Array.isArray(res) ? res : (res.data || []);

        if (this.instances.length === 0) {
          container.innerHTML = `
            <div class="wox-glass-card" style="grid-column:1/-1; padding:48px; text-align:center;">
              <div style="font-size:48px; margin-bottom:16px;">📱</div>
              <h3 style="color:#FFF; font-size:18px; font-weight:700; margin-bottom:8px;">لا توجد أرقام متصلة حالياً</h3>
              <p style="color:#94A3B8; font-size:14px; margin-bottom:20px;">ابدأ بربط رقم الواتساب الخاص بمتجرك أو شركتك لتفعيل الإشعارات والرد الآلي.</p>
              <button class="wox-btn-primary" onclick="InstancesModule.openCreateModal()">ربط أول رقم الآن</button>
            </div>
          `;
          return;
        }

        container.innerHTML = this.instances.map((inst) => {
          const name = inst.name || inst.instanceName || 'Instance';
          const state = inst.connectionStatus?.state || inst.status || 'close';
          const isOnline = state === 'open';

          return `
            <div class="wox-glass-card" style="padding:24px; display:flex; flex-direction:column; justify-content:between;">
              <div>
                <div style="display:flex; justify-content:space-between; align-items:center; margin-bottom:16px;">
                  <div style="font-size:16px; font-weight:800; color:#FFFFFF;">${name}</div>
                  <span class="wox-status-dot ${isOnline ? 'online' : 'offline'}" title="${isOnline ? 'متصل' : 'غير متصل'}"></span>
                </div>
                <div style="font-size:13px; color:#94A3B8; margin-bottom:8px;">
                  الحالة: <strong style="color:${isOnline ? '#10B981' : '#EF4444'};">${isOnline ? 'متصل ويعمل' : 'بانتظار المسح / غير متصل'}</strong>
                </div>
                <div style="font-size:12px; color:#64748B; font-family:monospace; margin-bottom:20px;">
                  Token: ${inst.token ? inst.token.slice(0, 16) + '...' : 'محمي'}
                </div>
              </div>

              <div style="display:flex; gap:8px; border-top:1px solid rgba(255,255,255,0.08); padding-top:16px;">
                ${!isOnline ? `
                  <button class="wox-btn-primary" style="flex:1; justify-content:center; padding:8px;" onclick="InstancesModule.connectQr('${name}')">
                    مسح الـ QR
                  </button>
                ` : `
                  <button class="action-btn action-btn-dark" style="flex:1; justify-content:center;" onclick="WoxCore.showToast('القناة متصلة وجاهزة للإرسال')">
                    فحص الاتصال
                  </button>
                `}
                <button class="action-btn action-btn-danger" style="padding:8px 12px;" onclick="InstancesModule.deleteInstance('${name}')" title="حذف القناة">
                  حذف
                </button>
              </div>
            </div>
          `;
        }).join('');
      } catch (err) {
        container.innerHTML = `
          <div class="wox-glass-card" style="grid-column:1/-1; padding:32px; text-align:center; color:#EF4444;">
            تعذر تحميل قائمة القنوات. يرجى التأكد من تشغيل السيرفر والمحاولة مجدداً.
          </div>
        `;
      }
    },

    openCreateModal: async function () {
      const name = prompt('أدخل اسماً للجلسة الجديدة (مثال: MyStore_WhatsApp):');
      if (!name) return;

      const cleanName = name.replace(/[^a-zA-Z0-9_-]/g, '');
      if (!cleanName) {
        WoxCore.showToast('اسم الجلسة غير صالح', 'error');
        return;
      }

      try {
        WoxCore.showToast('جاري إنشاء الجلسة...', 'info');
        await WoxCore.api('/instance/create', {
          method: 'POST',
          body: { instanceName: cleanName, qrcode: true },
        });
        WoxCore.showToast(`تم إنشاء الجلسة ${cleanName} بنجاح`, 'success');
        this.loadInstances();
        this.connectQr(cleanName);
      } catch (err) {
        WoxCore.showToast(err.message || 'فشل إنشاء الجلسة', 'error');
      }
    },

    connectQr: async function (instanceName) {
      const modal = document.getElementById('qr-modal');
      const title = document.getElementById('qr-instance-title');
      const wrapper = document.getElementById('qr-image-wrapper');

      if (modal) modal.style.display = 'flex';
      if (title) title.innerText = `مسح QR للجلسة: ${instanceName}`;
      if (wrapper) wrapper.innerHTML = '<div style="color:#333; padding-top:80px; font-size:13px;">جاري جلب رمز الاستجابة السريعة...</div>';

      try {
        const res = await WoxCore.api(`/instance/connect/${instanceName}`);
        if (res.base64) {
          wrapper.innerHTML = `<img src="${res.base64}" alt="QR Code" style="width:200px; height:200px; display:block;">`;
        } else if (res.code) {
          wrapper.innerHTML = `<div style="padding:20px; font-size:22px; font-weight:800; letter-spacing:4px; color:#1C1613;">${res.code}</div>`;
        } else {
          wrapper.innerHTML = '<div style="color:#10B981; padding-top:80px; font-weight:700;">الجلسة متصلة بالفعل ✅</div>';
          setTimeout(() => this.closeQrModal(), 2000);
          this.loadInstances();
        }
      } catch (err) {
        wrapper.innerHTML = `<div style="color:#EF4444; padding-top:70px; font-size:13px;">${err.message || 'تعذر توليد الرمز'}</div>`;
      }
    },

    closeQrModal: function () {
      const modal = document.getElementById('qr-modal');
      if (modal) modal.style.display = 'none';
    },

    deleteInstance: async function (instanceName) {
      if (!confirm(`هل أنت متأكد من حذف الجلسة "${instanceName}"؟`)) return;
      try {
        await WoxCore.api(`/instance/delete/${instanceName}`, { method: 'DELETE' });
        WoxCore.showToast(`تم حذف الجلسة ${instanceName}`, 'success');
        this.loadInstances();
      } catch (err) {
        WoxCore.showToast(err.message || 'فشل حذف الجلسة', 'error');
      }
    },
  };

  window.InstancesModule = InstancesModule;
  document.addEventListener('DOMContentLoaded', () => InstancesModule.init());
})();
