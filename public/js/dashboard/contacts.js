/**
 * 👥 Wox Dashboard: Contacts & Audience Module (Isolated Scope)
 */

(function () {
  'use strict';

  const ContactsModule = {
    contacts: [],

    init: async function () {
      WoxClientLayout.init('contacts');
      this.render();
      try {
        await this.loadContacts();
      } catch (err) {
        WoxCore.handlePageError('جهات الاتصال', err);
      }
    },

    render: function () {
      const container = document.getElementById('module-content-container');
      if (!container) return;

      container.innerHTML = `
        <div style="display:flex; justify-content:space-between; align-items:center; margin-bottom:24px;">
          <div>
            <h1 style="font-size:24px; font-weight:800; color:#FFFFFF; margin-bottom:6px;">جهات الاتصال والعملاء</h1>
            <p style="color:#94A3B8; font-size:14px;">قوائم العملاء المصنفة حسب المتجر، الدولة، والوسوم.</p>
          </div>
          <button class="wox-btn-primary" onclick="ContactsModule.addContact()">
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><line x1="12" y1="5" x2="12" y2="19"></line><line x1="5" y1="12" x2="19" y2="12"></line></svg>
            إضافة جهة اتصال
          </button>
        </div>

        <div class="wox-glass-card" style="padding:24px;">
          <div style="overflow-x:auto;">
            <table style="width:100%; border-collapse:collapse; text-align:right;">
              <thead>
                <tr style="border-bottom:1px solid rgba(255,255,255,0.1); color:#A89F96; font-size:13px;">
                  <th style="padding:12px;">الاسم</th>
                  <th style="padding:12px;">رقم الهاتف</th>
                  <th style="padding:12px;">التصنيف</th>
                  <th style="padding:12px;">الدولة</th>
                  <th style="padding:12px;">إجراءات</th>
                </tr>
              </thead>
              <tbody id="contacts-table-body">
                <tr><td colspan="5" style="text-align:center; padding:24px; color:#94A3B8;">جاري جلب جهات الاتصال...</td></tr>
              </tbody>
            </table>
          </div>
        </div>
      `;
    },

    loadContacts: async function () {
      const tbody = document.getElementById('contacts-table-body');
      try {
        const res = await WoxCore.api('/saas/data');
        this.contacts = (res.data && res.data.contacts) || [
          { id: '1', name: 'أحمد العتيبي', phone: '+966 50 123 4567', tag: 'VIP', country: 'SA' },
          { id: '2', name: 'Sara Mohamed', phone: '+20 100 234 5678', tag: 'متجر', country: 'EG' },
          { id: '3', name: 'محمد الشهري', phone: '+966 55 987 6543', tag: 'VIP', country: 'SA' },
        ];

        tbody.innerHTML = this.contacts.map((c) => `
          <tr style="border-bottom:1px solid rgba(255,255,255,0.05); color:#FFF; font-size:14px;">
            <td style="padding:14px; font-weight:700;">${c.name}</td>
            <td style="padding:14px; direction:ltr; text-align:right; font-family:monospace;">${c.phone}</td>
            <td style="padding:14px;"><span style="background:rgba(59,130,246,0.15); color:#3B82F6; padding:3px 8px; border-radius:6px; font-size:12px; font-weight:700;">${c.tag}</span></td>
            <td style="padding:14px;">${c.country === 'SA' ? '🇸🇦 السعودية' : '🇪🇬 مصر'}</td>
            <td style="padding:14px;">
              <a href="/dashboard/messages" class="action-btn action-btn-dark" style="padding:4px 10px; font-size:12px;">مراسلة</a>
            </td>
          </tr>
        `).join('');
      } catch (err) {
        tbody.innerHTML = `<tr><td colspan="5" style="text-align:center; padding:24px; color:#EF4444;">تعذر تحميل جهات الاتصال</td></tr>`;
      }
    },

    addContact: function () {
      const name = prompt('أدخل اسم العميل:');
      if (!name) return;
      const phone = prompt('أدخل رقم الهاتف مع المفتاح الدولي (مثال: +966501234567):');
      if (!phone) return;

      this.contacts.unshift({
        id: Date.now().toString(),
        name,
        phone,
        tag: 'جديد',
        country: phone.startsWith('+20') || phone.startsWith('20') ? 'EG' : 'SA',
      });

      this.loadContacts();
      WoxCore.showToast(`تمت إضافة ${name} بنجاح ✅`, 'success');
    },
  };

  window.ContactsModule = ContactsModule;
  document.addEventListener('DOMContentLoaded', () => ContactsModule.init());
})();
